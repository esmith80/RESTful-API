/*
* Request handlers
*
*/

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// Define the handlers
// This is a container for ALL of the handlers
// 
const handlers = {};

// Users
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check that all required fields are filled out (i.e. check that the user gave us all the required info in the payload)
  let firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  let tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? data.payload.tosAgreement : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            'tosAgreement': true,
          };

          // Store the user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password' });
        }

      } else {
        // User already exists
        callback(400, { 'Error': 'A user with that phone number already exists' });
      }

    })
  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }
};

// Users - GET
// Required data: phone
// Optional data: none

handlers._users.get = (data, callback) => {
  // Check that the phone number provided is valid
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // only let an authenticated user access their object. Don't let them access other user objects
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    // Verify that the given token from the headers is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, (err, dataFromRead) => {
          if (!err && dataFromRead) {
            // remove the hashed password from the user object before returning it to the requester
            delete dataFromRead.hashedPassword;
            callback(200, dataFromRead);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { "Error": "Missing required token in header, or token is invlaid." });
      }
    });

  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};

// Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)

handlers._users.put = (data, callback) => {
  // Check for the required field
  const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  
  // Check for the optional fields
  let firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // only let an authenticated user update their own object. Don't let them update anyone else's
      // Grab the token from the headers
      const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
      // Verify that the given token from the headers is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // Update the necessary fields
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'Could not update the user' });
                }
              });
            } else {
              callback(400, { 'Error': 'The specified user does not exist' });
            }
          });
        } else {
          callback(403, { "Error": "Missing required token in header, or token is invlaid." });
        }
      });
    }
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};

// Users - DELETE
// Required field: phone
// @TODO CLeanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
  
  if (phone) {
    // Grab the token from the headers
    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    // Only let an authenticated user delete their object. Don't let them delete anyone else's object.
    // Verify that the given token from the headers is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { "Error": "Could not delete the specified user" });
              }
            });
          } else {
            callback(400, { "Error": "Could not find specified user." });
          }
        });
      } else {
        callback(403, { "Error": "Missing required token in header, or token is invlaid." });
      }
    });
  } else {
    callback(400, { "Error": "Missing required field" });
  }
};

// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required: phone, password (because remember this is a user creating a token)
// Optional data: none
handlers._tokens.post = (data, callback) => {
  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
    // Lookup the user who matches that phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // If valid, create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone,
            tokenId,
            expires
          };

          // Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { "Error": "Could not create the new token." })
            }
          })
        } else {
          callback(400, { "Error": "Password did not match the specified user's stored password." });
        }

      } else {
        callback(400, { "Error": "Could not find the specified user" });
      }
    });

  } else {
    callback(400, { "Error": "Missing required field(s)" });
  }
};

// Tokens - get
// Required data : id
// Optional data : none
handlers._tokens.get = (data, callback) => {
  // Check that the id provided is valid
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, {});
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field or invalid token' });
  }
};

// Tokens - put
// Required data : id, extend
// Optional data : none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === true ? data.payload.extend : false;
  if (id && extend) {
    // Lookup the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration 
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the new updates
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { "Error": "Could not update the token's expiration" });
            }
          })

        } else {
          callback(400, { "Error": "The token has expired and cannot be extended." });
        }
      } else {
        callback(400, { "Error": "Specified token does not exist" });
      }
    });
  } else {
    callback(400, { "Error": "Missing required fields or fields are invalid" });
  }
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check that the id is valid
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    // Look up the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { "Error": "Could not delete the specified token" });
          }
        });
      } else {
        callback(400, { "Error": "Could not find specified token." });
      }
    });
  } else {
    callback(400, { "Error": "Missing required field" });
  }
};

// Verify that a given token id  is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};


// Checks
handlers.checks = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the checks methods
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none

handlers._checks.post = (data, callback) => {
  let protocol = typeof (data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  let url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  let method = typeof (data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method.trim() : false;
  let successCodes = typeof (data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  let timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
  
  if (protocol && url && method && successCodes && timeoutSeconds) {
  // Get the token from the headers
  const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

  // Lookup the user by reading the token
  _data.read('tokens', token, (err, tokenData) => {
    if(!err && tokenData) {
      const userPhone = tokenData.phone;

      // Lookup the user data
      _data.read('users', userPhone, (err, userData) => {
        if(!err && userData) {

        } else {
          callback(403);
        }
      });
    }
  });
  } else {
    callback(400, {"Error" : "Missing required inputs or inputs are invalid"});
  }

};

// Hello handler
handlers.hello = (data, callback) => {
  callback(200, { "message": "Hello there, you found some JSON" });
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};


// Export the module
module.exports = handlers;