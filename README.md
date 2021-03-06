# Google Cloud Runtime Configuration Util (grcutil)

> An easy cli for basic [Google Cloud Runtime Configuration](https://cloud.google.com/deployment-manager/runtime-configurator/reference/rest/) usage.

## Features

The focus here is on a clear, easy-to-use interface for the most commonly needed functions of the Runtime Configuration service. Install and take a look at at the help text for detail.

- `get` - Gets a variable from a Runtime Configuration config
- `set` - Sets a variable
- `unset` - Unset a variable
- `print` - Print the whole config to stdout in env or json format
- `create` - Create a new config with the provided name
- `pipe` - Pipe env-formatted stdin to the named config, loading it with variables. [EXPERIMENTAL]

## Installation

```sh
$ yarn add @mshick/google-cloud-runtime-configuration-util [--global]
```

```sh
$ npm install @mshick/google-cloud-runtime-configuration-util [--global]
```

## Usage

Simple examples:

```sh
$ grcutil set my-project FOO bar
# bar
$ grcutil get my-project FOO
# bar
$ grcutil print my-project
# FOO=bar
$ grcutil set my-project base64-val simpleval --to-base64
# c2ltcGxldmFs
$ grcutil print my-project --constant-case --print-format json
# { "FOO": "bar", "BASE64_VAL": "c2ltcGxldmFs" }
$ echo 'FOO=bar' | grcutil pipe my-project
# FOO=bar
```

For a full list of functionality and more examples:

```sh
$ grcutil --help
```

## Related

- [@google-cloud/rcloadenv](https://github.com/googleapis/nodejs-rcloadenv)
