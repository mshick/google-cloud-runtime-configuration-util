"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printVariableList = exports.listValues = exports.unsetValue = exports.setValue = exports.getValue = exports.GrcPrintFormat = exports.GrcPrintVariableFormat = void 0;
const googleapis_1 = require("googleapis");
const helpers_1 = require("./helpers");
const runtimeconfig = googleapis_1.google.runtimeconfig('v1beta1');
const auth = new googleapis_1.google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloudruntimeconfig'],
});
var GrcPrintVariableFormat;
(function (GrcPrintVariableFormat) {
    GrcPrintVariableFormat["Source"] = "SOURCE";
    GrcPrintVariableFormat["Constant"] = "CONSTANT";
})(GrcPrintVariableFormat = exports.GrcPrintVariableFormat || (exports.GrcPrintVariableFormat = {}));
var GrcPrintFormat;
(function (GrcPrintFormat) {
    GrcPrintFormat["Env"] = "ENV";
    GrcPrintFormat["Json"] = "JSON";
})(GrcPrintFormat = exports.GrcPrintFormat || (exports.GrcPrintFormat = {}));
// Shorten for convenience and readability, bind context
const getConfig = (params) => runtimeconfig.projects.configs.get(params);
const getVariable = (params) => runtimeconfig.projects.configs.variables.get(params);
const createVariable = (params) => runtimeconfig.projects.configs.variables.create(params);
const deleteVariable = (params) => runtimeconfig.projects.configs.variables.delete(params);
const updateVariable = (params) => runtimeconfig.projects.configs.variables.update(params);
const listVariables = (params) => runtimeconfig.projects.configs.variables.list(params);
const getConfigResourceName = (projectId, configName) => `projects/${projectId}/configs/${configName}`;
const getVariableResourceName = (projectId, configName, variableName) => `projects/${projectId}/configs/${configName}/variables/${variableName}`;
// Simple helper function to determine whether a config exists so we can throw clear errors
async function ensureConfig(authClient, projectId, configName) {
    try {
        const configResourceName = getConfigResourceName(projectId, configName);
        await getConfig({
            auth: authClient,
            name: configResourceName,
        });
    }
    catch (err) {
        if (err.code === 404) {
            throw new Error(`config '${configName}' does not exist`);
        }
        throw err;
    }
}
async function ensureProjectId(projectId) {
    if (!projectId) {
        projectId = await auth.getProjectId();
    }
    if (!projectId) {
        throw new Error('Unable to find a project id.');
    }
    return projectId;
}
async function getValue(configName, variableName, projectId) {
    try {
        projectId = await ensureProjectId(projectId);
        const authClient = await auth.getClient();
        await ensureConfig(authClient, projectId, configName);
        const variableResourceName = getVariableResourceName(projectId, configName, variableName);
        const response = await getVariable({
            auth: authClient,
            name: variableResourceName,
        });
        return {
            name: variableName,
            value: response.data.text || '',
        };
    }
    catch (err) {
        // Handle variables that don't exist gracefully
        if (err.code === 404) {
            return {
                name: variableName,
                value: null,
            };
        }
        throw err;
    }
}
exports.getValue = getValue;
async function setValue(configName, variableName, value, projectId) {
    projectId = await ensureProjectId(projectId);
    helpers_1.validateVariableName(variableName);
    const authClient = await auth.getClient();
    const existing = await getValue(configName, variableName, projectId);
    let newValue;
    const variableResourceName = getVariableResourceName(projectId, configName, variableName);
    if (existing.value === null) {
        const configResourceName = getConfigResourceName(projectId, configName);
        const response = await createVariable({
            auth: authClient,
            parent: configResourceName,
            requestBody: {
                name: variableResourceName,
                text: value,
            },
        });
        newValue = response.data.text;
    }
    else {
        const response = await updateVariable({
            auth: authClient,
            name: variableResourceName,
            requestBody: {
                name: variableResourceName,
                text: value,
            },
        });
        newValue = response.data.text;
    }
    return {
        name: variableName,
        value: newValue || '',
    };
}
exports.setValue = setValue;
async function unsetValue(configName, variableName, projectId) {
    projectId = await ensureProjectId(projectId);
    const authClient = await auth.getClient();
    await ensureConfig(authClient, projectId, configName);
    const variableResourceName = getVariableResourceName(projectId, configName, variableName);
    await deleteVariable({
        auth: authClient,
        name: variableResourceName,
    });
    return '';
}
exports.unsetValue = unsetValue;
async function listValues(configName, projectId) {
    projectId = await ensureProjectId(projectId);
    const authClient = await auth.getClient();
    await ensureConfig(authClient, projectId, configName);
    const resourceName = getConfigResourceName(projectId, configName);
    const response = await listVariables({
        auth: authClient,
        parent: resourceName,
        returnValues: true,
    });
    const variableList = response.data.variables &&
        response.data.variables
            .filter((v) => v.name)
            .map((v) => ({
            name: v.name.split('/').slice(-1)[0],
            value: v.text || '',
        }));
    return {
        variables: variableList || [],
    };
}
exports.listValues = listValues;
function printVariableList(variableList, printFormat = GrcPrintFormat.Env, variableNameFormat = GrcPrintVariableFormat.Source) {
    if (variableNameFormat === GrcPrintVariableFormat.Constant) {
        variableList.variables = variableList.variables.map((v) => ({ ...v, name: helpers_1.constantCase(v.name) }));
    }
    if (printFormat === GrcPrintFormat.Env) {
        return variableList.variables.reduce((s, v) => (s += `${v.name}=${v.value}\n`), '');
    }
    if (printFormat === GrcPrintFormat.Json) {
        return JSON.stringify(variableList.variables.reduce((s, v) => ({ ...s, [v.name]: v.value }), {}), null, 2);
    }
    return '';
}
exports.printVariableList = printVariableList;
//# sourceMappingURL=grcutil.js.map