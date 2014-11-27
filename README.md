# owl

Spiking out a client for capturing and uploading video.

## Development

The build pipeline for the project has a few dependences.

- Node.js
- gulp
- Ruby

To install the dependencies on a Mac, with [Homebrew](http://brew.sh):

```
$ brew install node
$ npm install -g gulp
$ # ruby is already installed
```

### Getting the project

Clone the github repository, and install project packages.

```
$ git clone git@github.com:cantorandball/owl-client.git owl-client
$ cd owl-client
$ bundle install --path vendor/bundle
$ npm install
```

### Building the project

From the repository root:

```
$ gulp build
```

Or keep watching for changes to recompile with:

```
$ gulp dev
```
