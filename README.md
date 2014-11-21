# owl

This is the website for [owl](http://example.com).

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
$ git clone REPOSITORY owl
$ cd owl
$ bundle install --path vendor/bundle
$ npm install
```

### Building the project

From the repository root.

```
$ gulp build
```

## Deployment

The website is hosted using [GitHub Pages](https://pages.github.com).
To deploy:

```
$ gulp build
$ gulp deploy
```

