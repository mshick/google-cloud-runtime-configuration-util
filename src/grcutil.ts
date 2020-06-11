import {google, runtimeconfig_v1beta1} from 'googleapis'
import {JWT, Compute, UserRefreshClient} from 'google-auth-library'
import {constantCase, validateVariableName} from './helpers'

const runtimeconfig = google.runtimeconfig('v1beta1')

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloudruntimeconfig'],
})

type AuthClient = JWT | Compute | UserRefreshClient

export interface GrcVariable {
  name: string
  value: string | null
}

export interface GrcVariableList {
  variables: GrcVariable[]
}

export enum GrcPrintVariableFormat {
  Source = 'SOURCE',
  Constant = 'CONSTANT',
}

export enum GrcPrintFormat {
  Env = 'ENV',
  Json = 'JSON',
}

// Shorten for convenience and readability, bind context
const getConfig = (params: runtimeconfig_v1beta1.Params$Resource$Projects$Configs$Get) =>
  runtimeconfig.projects.configs.get(params)

const getVariable = (params: runtimeconfig_v1beta1.Params$Resource$Projects$Configs$Variables$Get) =>
  runtimeconfig.projects.configs.variables.get(params)

const createVariable = (params: runtimeconfig_v1beta1.Params$Resource$Projects$Configs$Variables$Create) =>
  runtimeconfig.projects.configs.variables.create(params)

const deleteVariable = (params: runtimeconfig_v1beta1.Params$Resource$Projects$Configs$Variables$Delete) =>
  runtimeconfig.projects.configs.variables.delete(params)

const updateVariable = (params: runtimeconfig_v1beta1.Params$Resource$Projects$Configs$Variables$Update) =>
  runtimeconfig.projects.configs.variables.update(params)

const listVariables = (params: runtimeconfig_v1beta1.Params$Resource$Projects$Configs$Variables$List) =>
  runtimeconfig.projects.configs.variables.list(params)

const getConfigResourceName = (projectId: string, configName: string) => `projects/${projectId}/configs/${configName}`

const getVariableResourceName = (projectId: string, configName: string, variableName: string) =>
  `projects/${projectId}/configs/${configName}/variables/${variableName}`

// Simple helper function to determine whether a config exists so we can throw clear errors
async function ensureConfig(authClient: AuthClient, projectId: string, configName: string): Promise<void> {
  try {
    const configResourceName = getConfigResourceName(projectId, configName)
    await getConfig({
      auth: authClient,
      name: configResourceName,
    })
  } catch (err) {
    if (err.code === 404) {
      throw new Error(`config '${configName}' does not exist`)
    }
    throw err
  }
}

async function ensureProjectId(projectId?: string): Promise<string> {
  if (!projectId) {
    projectId = await auth.getProjectId()
  }

  if (!projectId) {
    throw new Error('Unable to find a project id.')
  }

  return projectId
}

export async function getValue(configName: string, variableName: string, projectId?: string): Promise<GrcVariable> {
  try {
    projectId = await ensureProjectId(projectId)

    const authClient = await auth.getClient()

    await ensureConfig(authClient, projectId, configName)

    const variableResourceName = getVariableResourceName(projectId, configName, variableName)

    const response = await getVariable({
      auth: authClient,
      name: variableResourceName,
    })

    return {
      name: variableName,
      value: response.data.text || '',
    }
  } catch (err) {
    // Handle variables that don't exist gracefully
    if (err.code === 404) {
      return {
        name: variableName,
        value: null,
      }
    }
    throw err
  }
}

export async function setValue(
  configName: string,
  variableName: string,
  value: string,
  projectId?: string,
): Promise<GrcVariable> {
  projectId = await ensureProjectId(projectId)

  validateVariableName(variableName)

  const authClient = await auth.getClient()

  const existing = await getValue(configName, variableName, projectId)

  let newValue

  const variableResourceName = getVariableResourceName(projectId, configName, variableName)

  if (existing.value === null) {
    const configResourceName = getConfigResourceName(projectId, configName)
    const response = await createVariable({
      auth: authClient,
      parent: configResourceName,
      requestBody: {
        name: variableResourceName,
        text: value,
      },
    })
    newValue = response.data.text
  } else {
    const response = await updateVariable({
      auth: authClient,
      name: variableResourceName,
      requestBody: {
        name: variableResourceName,
        text: value,
      },
    })
    newValue = response.data.text
  }

  return {
    name: variableName,
    value: newValue || '',
  }
}

export async function unsetValue(configName: string, variableName: string, projectId?: string): Promise<string> {
  projectId = await ensureProjectId(projectId)

  const authClient = await auth.getClient()

  await ensureConfig(authClient, projectId, configName)

  const variableResourceName = getVariableResourceName(projectId, configName, variableName)

  await deleteVariable({
    auth: authClient,
    name: variableResourceName,
  })

  return ''
}

export async function listValues(configName: string, projectId?: string): Promise<GrcVariableList> {
  projectId = await ensureProjectId(projectId)

  const authClient = await auth.getClient()

  await ensureConfig(authClient, projectId, configName)

  const resourceName = getConfigResourceName(projectId, configName)

  const response = await listVariables({
    auth: authClient,
    parent: resourceName,
    returnValues: true,
  })

  const variableList =
    response.data.variables &&
    response.data.variables
      .filter((v) => v.name)
      .map(
        (v): GrcVariable => ({
          name: v.name!.split('/').slice(-1)[0],
          value: v.text || '',
        }),
      )

  return {
    variables: variableList || [],
  }
}

export function printVariableList(
  variableList: GrcVariableList,
  printFormat = GrcPrintFormat.Env,
  variableNameFormat = GrcPrintVariableFormat.Source,
): string {
  if (variableNameFormat === GrcPrintVariableFormat.Constant) {
    variableList.variables = variableList.variables.map((v) => ({...v, name: constantCase(v.name)}))
  }

  if (printFormat === GrcPrintFormat.Env) {
    return variableList.variables.reduce((s, v) => (s += `${v.name}=${v.value}\n`), '')
  }

  if (printFormat === GrcPrintFormat.Json) {
    return JSON.stringify(
      variableList.variables.reduce((s, v) => ({...s, [v.name]: v.value}), {}),
      null,
      2,
    )
  }

  return ''
}
