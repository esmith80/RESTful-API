/*
* Primary file for the API
*
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);    
});

// Start the server
httpServer.listen(config.httpPort, () => {
    console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
  'key'  : fs.readFileSync('./https/key.pem'), 
  'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(`The server is listening on port ${config.httpsPort}`);
});

// All the server logic for both the http and https server
let unifiedServer = (req, res) => {
  // Get the URL and parse it
  // this is the supported/recommended way to create a new url (using the URL WHATWG API instead of the legacy Node API)
  // const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // below (commented out) is the way from Pirple tutorial (older method not using new URL Object
  // using the old way changes the structure of the URL object (the keys on the URL object are named differently)
  const parsedUrl = url.parse(req.url, true);

  // Get the path from that URL
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); 
  // the above regex is saying: 
  //    carat matching attempt starting at the beginning, 
  //    one slash (the escaped forward slash)
  //    the + sign - or more than one (unlimited times) forward slash
  //    pipe means 'or'
  //    \/+ means unlimited forward slashes 
  //    $ means the preceding character must be the final character in the string (i.e. the string must end in a forward slash)
  //    
  console.log('trimmed path is: ', trimmedPath);

  // Get the query string as an object (the 'true' argument in the url.parse(req.url, true))
  // const queryStringObject = parsedUrl.search;

  // This is the Pirple tutorial way of doing it (not using the URL object) 
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method that was requested (there is a 'method' key on the req object that gives us this info)
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';


  // events if a request contains data, when a request ends
  // the data event fills up the buffer as it receives data piece by piece
  req.on('data', data => {
    buffer += decoder.write(data);
  });
  // this is the end of the request, after no more data has to come in this event happens at the end of the request so it will always be triggered
  // at this point, the buffer has been filled up by some number of packets that have come in with data and the end of the request has been signaled
  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found, use the not found handler.
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    
    // Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response (note that writeHead has to come last)
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
      
      // Log the response
      console.log('Returning this response: ', statusCode, payloadString);

    });
    
    // Log the requst payload (buffer)
    console.log('Request received with this payload: ', buffer);

  });
  
};

// Define a request router
const router = {
  'tokens' : handlers.tokens,
  'hello' : handlers.hello,
  'users' : handlers.users,
  'checks' : handlers.checks
};