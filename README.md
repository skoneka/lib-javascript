# Pryv library for Javascript

Javascript library (browser & Node.js) to access and manipulate Pryv users data.

[![NPM version](https://badge.fury.io/js/pryv.png)](http://badge.fury.io/js/pryv)


## Usage

### Installation

- Browser: `<script type="text/javascript" src="http://api.pryv.com/lib-javascript/latest/pryv.js"></script>`
- Node.js: `npm install pryv`

### Examples

```
// set connection to the API
var connection = new pryv.Connection('{username}', '{token}');

// create a event
var eventData = { streamId : 'diary', type: 'note/txt', content: 'I track, therefore I am.' };
connection.events.create(eventData, function(err, event) { 
   console.log('Event created: ' + event.id);
});
```

## Contribute

### Dev environment setup

Read, then run `./scripts/setup-environment-dev.sh`

### Build and tests

`grunt`:

- applies code linting (with JSHint)
- browserifies the lib into `dist/{version}` as well as `dist/latest` for browser standalone distribution
- runs the tests, outputting coverage info into `test/coverage.html`
- builds documentation into `doc`

Also: `grunt test` & `grunt watch` (runs tests on changes)

### Publish

After building, just commit and push changes from `dist` (working copy of `gh-pages` branch).


## License

[Revised BSD license](https://github.com/pryv/documents/blob/master/license-bsd-revised.md)
