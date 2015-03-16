# Pryv library for Javascript

Javascript library (browser & Node.js) to access and manipulate Pryv users data.

[![NPM version](https://badge.fury.io/js/pryv.png)](http://badge.fury.io/js/pryv)  [![Stories in Ready](https://badge.waffle.io/pryv/lib-javascript.svg?label=ready&title=Ready)](http://waffle.io/pryv/lib-javascript) 


## Usage

### Installation

- Browser: `<script type="text/javascript" src="http://api.pryv.com/lib-javascript/latest/pryv.js"></script>`
- Node.js: `npm install pryv`

### Docs

- [Getting started guide](http://pryv.github.io/getting-started/javascript/)
- [JS docs](http://pryv.github.io/lib-javascript/latest/docs/)


## Contribute

### Dev environment setup

Read, then run `./scripts/setup-environment-dev.sh`

### Build and tests

`grunt`:

- applies code linting (with JSHint)
- builds documentation into `dist/{version}/docs`
- browserifies the lib into `dist/{version}` as well as `dist/latest` for browser standalone distribution
- runs the tests, outputting coverage info into `test/coverage.html`

Also: `grunt test` & `grunt watch` (runs tests on changes)

`./scripts/update-event-types.bash` updates the default event types and extras by fetching the latest master versions online.

### Publish

After building, just commit and push changes from `dist` (working copy of `gh-pages` branch).


## License

[Revised BSD license](https://github.com/pryv/documents/blob/master/license-bsd-revised.md)
