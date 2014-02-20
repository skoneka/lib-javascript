# Pryv library for Javascript

Javascript library (browser & Node.js) to access and manipulate Pryv users data.

[![NPM version](https://badge.fury.io/js/pryv.png)](http://badge.fury.io/js/pryv)


## Usage

### Installation

- Browser: `<script type="text/javascript" src="pryv/pryv.js"></script>` (files in `dist` folder)
- Node.js: `npm install pryv

### Examples

```
// set connection to the API
var connection = new Pryv.Connection('{username}', '{token}');

// create a event
var eventData = { streamId : 'diary', type: 'note/txt', content: 'I track, therefore I am.' };
connection.events.create(eventData, function(err, event) { 
   console.log('Event created: ' + event.id);
});
```

## Contribute

### Dev environment setup

```
npm install
# if not installed already:
npm install -g grunt-cli
```

### Tests

`grunt`:

- applies code linting (with JSHint)
- browserifies the lib into `dist/pryv.js` for browser distribution
- runs the tests, outputting coverage info into `test/coverage.html`
- builds documentation into `doc`

Also: `grunt test` & `grunt watch` (runs tests on changes)


## License

[Revised BSD license](https://github.com/pryv/documents/blob/master/license-bsd-revised.md)
