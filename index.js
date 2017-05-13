// main file
// combines all other functionalities from the other files
// and exposes them as a single usable export
// see manualtest.js for usage

const titleScanParser = require('./parse-title-scan')

exports.parseTitleScan = titleScanParser.parse
