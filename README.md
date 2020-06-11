# Google Cloud Runtime Configuration Util (grcutil)

> An easy cli for basic [Google Cloud Runtime Configuration](https://cloud.google.com/deployment-manager/runtime-configurator/reference/rest/) usage.

## Features

The focus here is on a clear, easy-to-use interface for the most commonly needed functions of the Runtime Configuration service. Install and take a look at at the help text for detail.

- `get` - Gets a variable from a Runtime Configuration config
- `set` - Sets a variable
- `unset` - Unset a variable
- `print` - Print the whole config to stdout in env or json format

## Installation

```sh
$ yarn add @mshick/google-cloud-runtime-configuration-util [--global]
```

```sh
$ npm install @mshick/google-cloud-runtime-configuration-util [--global]
```

## Usage

```sh
$ rcutil --help
```

## Related

- [@google-cloud/rcloadenv](https://github.com/googleapis/nodejs-rcloadenv)
