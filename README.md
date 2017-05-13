# handbrake-utils
Node.js utilities for Handbrake CLI


## Note

Provides utilities to simplify working with Handbrake CLI via Node.js.
For example, Handbrake title scan output is in text format, which is software unfriendly. This utility converts it to a tree structure.


## Usage

Simply import the module and call the appropriate function

...
const fs = require("fs")
const handbrakeUtils = require('./index.js')

// assume titlescan.txt contains the output of handbrake -t 0
fs.readFile("titlescan.txt", 'utf8', function(err, text) {
  let titles = handbrakeUtils.parseTitleScan(text)
  console.log(titles)
})
...


## Documentation

### parseTitleScan(text)

This function parses the output generated by "handbrakeCli -t 0" into a tree structure
* text - a string that holds the output of handbrakeCLI title scan
* returns a tree structure
