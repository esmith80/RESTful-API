# UpTimeAPI Guide
The UpTimeAPI is a service that can monitor website metrics such as uptime.

## :information_source:&nbsp; This guide is for developers.

### Prerequisites
- JavaScript (advanced)

### How to use this API

```javascript
checkWebsiteStatus(url, [numberOfTries], [statusCode])
```

`checkWebsiteStatus` sends a `GET` request to the specified `url`. It returns a boolean based on a match with the `statusCode` that is specified and the status code that is part of the response. The expected `statusCode` is 200 by default and the `numberOfTries` is 1 by default.

Below is a table that shows the various combinations of parameters and expected outcomes:

<table>
  <theader>
    <tr>checkWebsiteAlive usage</tr>
    <tr>
      <td><strong>Parameter</td>
      <td>Default Value</td>
      <td>Type</td>
      <td>Required/Optional</td>
      <td>Usage</strong></td>
    </tr>
  </theader>
  <tbody>
    <tr>
     <td>url</td>
      <td>none</td>
      <td>string</td>
     <td>required</td>
     <td>This is the website or online resource you to check. The url must include the protocol (http or https)</td>     
    </tr>
    <tr>
    <td>numberOfTries</td>
      <td>1</td>
      <td>integer</td>
     <td>optional</td>
     <td>If numberOfTries is set to a non-zero positive number, then the url will be tried that many times (returning `true` on the first successful attempt or `false` if the resource cannot be found after that number of tries. If the `numberOfTries` is set to `-1` the API will attempt to connect to the website repeatedly for 10 seconds until either a) it is found successfully, in which case it will return `true` or b) 10 seconds has passed with only failed attempts in which case it will retuurn `false`.</td>
    </tr>
    <tr>
     <td>statusCode</td>
      <td>200</td>
      <td>integer</td>
     <td>optional</td>
     <td>This is the status code that is expected based on a GET request to the url. If a GET request to the url returns this status code, the checkWebsiteStatus returns true. </td>     
    </tr>
  </tbody>
</table>

### Use Cases
>**Use Case A**: Check if a website is live.
```javascript
checkWebsiteStatus('https://www.example.com');
// returns true only if GET request to example.com returns status code 200
```

>**Use Case B**: Check if website is vulnerable to denial of service DoS attack
```javascript
checkWebsiteStatus('https://www.example.com/API', 1000);
// returns true if status code 200 is returned 100 times in a row
```

>**Use Case C**: Check if a website's access rights/permissions are working
```javascript
checkWebsiteStatus('https://www.example.com/secure_login_page', 1, 403);
// returns true if request to url returns 403 (permission denied) status code
```
