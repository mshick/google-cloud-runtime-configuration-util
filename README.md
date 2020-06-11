# Google Cloud Runtime Configuration Util (grcutil)

> An easy to use cli for basic [Google Cloud Runtime Configuration](https://cloud.google.com/deployment-manager/runtime-configurator/reference/rest/) activities.

## Usage

```sh
$ rcutil [command] [config] [arg1] [arg2] [--flags] [--project]
$ rcutil set my-project foo bar
# FOO=bar
$ rcutil set my-project cute puppy --no-uppercase
# cute=puppy
$ rcutil get my-project foo
# bar
$ rcutil print my-project
# FOO=bar
# cute=puppy
```
