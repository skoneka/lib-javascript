# Pryv library for Javascript

TODO: description


# Usage

## Example

	<html>
	 <head>
	  <link rel="javascript" type="text/javascript" href="https://sw.pryv.io/dist/javascript/browser-lib.js">
	 </head>
	 <body>
	 <script>
	 
	 
	 </script>
	 </body>
	</html>
	
## Open a connection


### if you known the username and token
	
	`var connection = new Pryv



# Development environement


## Setup

```
npm install
# if not installed already:
npm install -g grunt-cli
```

## Building/running the tests

`grunt`:

- browserifies the lib into `dist/pryv.js`
- applies code linting (with JSHint)
- runs the tests, outputting coverage info into `test/coverage.html`
