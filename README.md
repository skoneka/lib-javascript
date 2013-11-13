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
	
## Open a connection and add an event


### if you known the username and token
	
	```
	// open a connection
	var connection = new Pryv.Connection('perkikiki', 'TTZycvBTiq');
	
	// create a event 
	var eventData = {streamId : 'diary', type: 'note/txt', content: 'I track, so I am'};
	connection.events.createWithData(eventData, function(error) { 
	   console.log('event created');
	});
    ```


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
