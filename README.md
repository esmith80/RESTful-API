### ⚠️ _This README does not currently reflect the actual functionality of the code in this repo. It is currently being used as an example of writing style._

# UpTimeAPI Guide
The UpTimeAPI is a service that can monitor website metrics such as uptime.

## :information_source:&nbsp; This guide is for developers.

### Prerequisites
- JavaScript (advanced)

### How to use this API

```javascript
checkWebsiteStatus(url, [statusCode], [numberOfTries], [finishAfterFirstMatch])
```

`checkWebsiteStatus` sends a `GET` request to the specified `url` and returns a boolean based on a match with the provided `statusCode`.

<table>
  <theader>
    <tr>
      <td><strong>Parameter</td>
      <td><strong>Default Value</strong></td>
      <td><strong>Type</strong></td>
      <td><strong>Required/Optional</strong></td>
      <td><strong>Usage</strong></td>
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
     <td>statusCode</td>
      <td>200</td>
      <td>integer</td>
     <td>optional</td>
     <td>This is the status code that is expected based on a GET request to the url. If a GET request to the url returns this status code, checkWebsiteStatus returns true. </td>     
    </tr>
    <tr>
    <td>numberOfTries</td>
      <td>1</td>
      <td>integer</td>
     <td>optional</td>
      <td>If <code>numberOfTries</code> is set to a non-zero positive number, then the url will be tried that many times (returning <code>true</code> on the first successful attempt or <code>false</code> if the resource cannot be found after that number of tries. 
        <br/>If <code>numberOfTries</code> is set to <code>-1</code> the API will attempt to connect to the website repeatedly for 10 seconds until either: a) it is found successfully, in which case it will return <code>true</code> or b) 10 seconds has passed with only failed attempts in which case it will return <code>false</code>.</td>
    </tr>    
    <tr>
     <td>finishAfterFirstMatch</td>
      <td>true</td>
      <td>boolean</td>
     <td>optional</td>
      <td>Return after the first successful match of the provided <code>statusCode</code> for a GET request to the provided <code>url</code>.</td>     
    </tr>
  </tbody>
</table>

### Use Cases
>**Use Case A**: Check if a website is live.
```javascript
checkWebsiteStatus('https://www.example.com');
// returns true only if GET request to example.com returns status code 200
```

>**Use Case B**: Check if a website's access rights/permissions are working
```javascript
checkWebsiteStatus('https://www.example.com/secure_login_page', 403);
// returns true if request to url returns 403 (permission denied) status code
```

>**Use Case C**: Check if website is vulnerable to denial of service DoS attack
```javascript
checkWebsiteStatus('https://www.example.com/API', 200, 1000, false);
// returns true if status code 200 is returned 1000 times in a row
```
