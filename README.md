# UpTimeAPI Guide
The UpTimeAPI is a service that can monitor website metrics such as uptime.

## :information_source:&nbsp; This guide is for developers.

### Prerequisites
- JavaScript (advanced)

### What does this API depend on?
Every effort is made to ensure that the dependencies of this API are valid. We have avoided the use of dependencies where possible, however the strength of the Node ecosystem is in this interwoven fabric of open source code. That said, if something happens that's beyond our control, sorry... 


### Features

### Use Cases
>**Use Case A**: Check if a website is live.
```javascript
checkWebsiteStatus('https://www.example.com');
// returns true only if GET request to example.com returns status code 200
```

>**Use Case B**: Check if website is vulnerable to denial of service DoS attack
```javascript
checkWebsiteStatus('https://www.example.com/API', 100);
// returns true if status code 200 is returned 100 times in a row
```

>**Use Case C**: Check if a website's access rights/permissions are working
```javascript
checkWebsiteStatus('https://www.example.com/secure_login_page', 1, 403);
// returns true if request to url returns 403 (permission denied) status code
```

### How to use this API

```javascript 
checkWebsiteStatus(url, [numberOfTries], [statusCode]);
// url (required): string, 
// numberOfTries (optional): integer
// statusCode (optional): integer
// Returns: Boolean
```
`checkWebsiteStatus` returns a boolean based on the status code returned after a `GET` request to the `url`. The typical use case is to check if a website is up. Therefore, the simplest use is to pass a `url` to try one request where the expected `statusCode` to return is 200. A website may be checked more than once if `numberOfTries` is passed. The expected `statusCode` is 200 by default, however if `statusCode` is supplied, it will be the expected status code of the GET request.

Below is a table that shows the various combinations of parameters and expected outcomes:

<table>
  <theader>
    <tr>checkWebsiteAlive usage</tr>
    <tr>
      <td>Parameter</td>
      <td>Type</td>
      <td>Required/Optional</td>
      <td>Usage</td>
    </tr>
  </theader>
  <tbody>
    <tr>
     <td>url</td>
      <td>string</td>
     <td>required</td>
     <td>This is the website or online resource you to check. The url must include the protocol (http or https)</td>     
    </tr>
    <tr>
    <td>numberOfTries</td>
      <td>integer</td>
     <td>optional</td>
     <td>If numberOfTries is set to a non-zero positive number, then the url will be tried that many times (returning `true` on the first successful attempt or `false` if the resource cannot be found after that number of tries. If the `numberOfTries` is set to `-1` the API will attempt to connect to the website repeatedly for 10 seconds until either a) it is found successfully, in which case it will return `true` or b) 10 seconds has passed with only failed attempts in which case it will retuurn `false`.</td>
    </tr>
    <tr>
     <td>statusCode</td>
      <td>integer</td>
     <td>optional</td>
     <td>This is the status code that is expected based on a GET request to the url. If a GET request to the url returns this status code, the checkWebsiteStatus returns true</td>     
    </tr>
  </tbody>
</table> 
