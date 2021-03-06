### ⚠️ _This README does not currently reflect the actual functionality of the code in this repo. It is currently being used as an example of writing style._

# UpTimeAPI Guide
The UpTimeAPI is a (fake!) service that can monitor website metrics such as uptime. It has one function called <code>checkWebsiteStatus</code>.

## :information_source:&nbsp; This guide is for developers.

### Prerequisites
- JavaScript (advanced)

### How to use this API

```javascript
checkWebsiteStatus(url, [expectedStatusCode], [numberOfTries], [finishAfterFirstMatch])
```

`checkWebsiteStatus` sends a `GET` request to the specified `url`. It then waits for a response to the request and returns a boolean based on a match with the `expectedStatusCode` of that response.

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
      <td><code>url</code></td>
      <td>none</td>
      <td>string</td>
     <td>required</td>
     <td>This is the website or resource to check. The url must include the full protocol ('http://' or 'https://')</td>     
    </tr>
    <tr>
     <td><code>expectedStatusCode</code></td>
      <td>200</td>
      <td>integer</td>
     <td>optional</td>
      <td>This is the status code that is expected in a response based on a <code>GET</code> request to the <code>url</code>. If a <code>GET</code> request to the <code>url</code> responds with this status code, <code>checkWebsiteStatus</code> returns <code>true</code>. </td>     
    </tr>
    <tr>
    <td><code>numberOfTries</code></td>
      <td>1</td>
      <td>integer</td>
     <td>optional</td>
      <td>If <code>numberOfTries</code> is set to a non-zero positive number, then the <code>url</code> will be tried that many times (returning <code>true</code> on the first successful attempt or <code>false</code> if the resource cannot be found after that number of tries. 
        <br/><br/>If <code>numberOfTries</code> is set to <code>-1</code> the API will attempt to connect to the website repeatedly for 10 seconds until either: <br/>a) it is found successfully, in which case it will return <code>true</code> or <br/>b) 10 seconds has passed with only failed attempts in which case it will return <code>false</code>.</td>
    </tr>    
    <tr>
     <td><code>finishAfterFirstMatch</code></td>
      <td>true</td>
      <td>boolean</td>
     <td>optional</td>
      <td>Return after the first successful match of the <code>expectedStatusCode</code> for a GET request to the provided <code>url</code>.</td>     
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

>**Use Case C**: Check if website is vulnerable to Denial of Service (DoS) attack
```javascript
checkWebsiteStatus('https://www.example.com/API', 200, 1000, false);
// returns true if status code 200 is returned 1000 times in a row
```
