# Why These Middleware Are Important
## helmet() - Security headers:

Sets various HTTP headers to secure your app
Prevents common vulnerabilities like XSS, clickjacking, etc.
Removes the X-Powered-By: Express header

## cors() - Cross-Origin Resource Sharing:

Allows your API to be accessed from different domains
Essential if you plan to build a separate frontend
Handles preflight requests for complex HTTP methods

## express.urlencoded({ extended: true }) - Form data parsing:

Parses URL-encoded data (from HTML forms)
extended: true allows rich objects and arrays