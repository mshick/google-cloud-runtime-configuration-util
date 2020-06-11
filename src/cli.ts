#!/usr/bin/env node

import {
  getValue,
  setValue,
  unsetValue,
  listValues,
  printVariableList,
  GrcPrintVariableFormat,
  GrcPrintFormat,
} from './grcutil'
import * as yargs from 'yargs'

interface GrcutilCliOptions {
  configName: string
  constantCase: boolean
  printFormat: GrcPrintFormat
  project?: string
  variableName: string
  variableValue: string
  toBase64: boolean
}

type GrcutilCliGetOptions = Pick<GrcutilCliOptions, 'configName' | 'variableName' | 'project'>
type GrcutilCliSetOptions = Pick<
  GrcutilCliOptions,
  'configName' | 'variableName' | 'variableValue' | 'toBase64' | 'project'
>
type GrcutilCliPrintOptions = Pick<GrcutilCliOptions, 'configName' | 'constantCase' | 'printFormat' | 'project'>

const cli = (exports.cli = yargs
  .command('get <configName> <variableName>', 'Get a variable with the given name.')
  .command('unset <configName> <variableName>', 'Unset a variable with the given name.')
  .command('set <configName> <variableName> <variableValue>', 'Set a variable with the given name and value.')
  .command('print <configName>', 'Print all the variable name/value pairs.')
  .usage(`rcutil command configName [variableName [variableValue]] [--screaming] [--project]`)
  .options({
    variableName: {
      description: 'The key or set or get.',
      type: 'string',
    },
    variableValue: {
      description: 'The value to set.',
      type: 'string',
    },
    configName: {
      description: 'The name of a config to use.',
      type: 'string',
    },
    constantCase: {
      alias: ['c'],
      default: false,
      description: 'Output all variables names in CONSTANT_CASE, e.g. my-value or myValue becomes MY_VALUE.',
      type: 'boolean',
    },
    toBase64: {
      alias: ['to-base64', 'b'],
      default: false,
      description: 'Base64 encode a value before storing. Helpful for making complex values env-safe.',
      type: 'boolean',
    },
    project: {
      alias: 'p',
      description: 'The project to use, overrides your default gcloud SDK project.',
      type: 'string',
    },
    printFormat: {
      alias: ['print-format', 'f'],
      default: 'ENV',
      description: 'The format to print in. Options are env, json.',
      type: 'string',
      choices: Object.values(GrcPrintFormat),
    },
  })
  .coerce('printFormat', (format: string) => format.toUpperCase())
  .example('grcutil set my-project FOO bar', 'Set the variable FOO to value bar on my-project')
  .example('grcutil get my-project foo', 'Get the value of variable FOO')
  .example('grcutil unset my-project foo', 'Unset the value of variable FOO')
  .example('grcutil print my-project', 'Print all variable names and values of my-project in env format.')
  .example(
    'grcutil print my-project --constant-case',
    'Print all variable names and values of my-project in typical CONSTANT_CASE env format.',
  )
  .example(
    'grcutil print my-project --print-format json',
    'Print all variable names and values of my-project as a JSON object to stdout.',
  )
  .example(
    'grcutil print my-project --project=bar',
    'Print all variable names and values of my-project in env format from the project bar.',
  )
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://github.com/mshick/google-cloud-runtime-configuration-util')
  .help()
  .strict())

async function main(argv: string[]): Promise<void> {
  const opts = cli.parse(argv)
  const command = opts._[0]

  try {
    let output

    if (command === 'get') {
      const {configName, variableName, project} = opts as GrcutilCliGetOptions
      const result = await getValue(configName, variableName, project)
      output = result.value
    }

    if (command === 'set') {
      const {configName, variableName, variableValue, toBase64, project} = opts as GrcutilCliSetOptions
      let variableValueToSet = variableValue
      if (toBase64) {
        variableValueToSet = Buffer.from(variableValue).toString('base64')
      }
      const result = await setValue(configName, variableName, variableValueToSet, project)
      output = result.value
    }

    if (command === 'unset') {
      const {configName, variableName, project} = opts as GrcutilCliGetOptions
      await unsetValue(configName, variableName, project)
      output = ''
    }

    if (command === 'print') {
      const {configName, constantCase, printFormat, project} = opts as GrcutilCliPrintOptions
      const result = await listValues(configName, project)
      output = printVariableList(
        result,
        printFormat,
        constantCase ? GrcPrintVariableFormat.Constant : GrcPrintVariableFormat.Source,
      )
    }

    console.log(output)
    process.exit(0)
  } catch (err) {
    console.error(`error: ${err.message}`)
    process.exit(1)
  }
}

if (module === require.main) {
  main(process.argv.slice(2)).catch(console.error)
}
