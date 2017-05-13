// usage: node manualtest <titlescan output file>

const promise = require('bluebird')
const fs = promise.promisifyAll(require("fs"))

const handbrakeUtils = require('./index.js')

async function parseCatalog() {
  let filepath = process.argv[2]
  let file = await fs.readFileAsync(filepath, 'utf8')
  // console.log(file)
  let titles = handbrakeUtils.parseTitleScan(file)
  console.log(JSON.stringify(titles, null, ' '))
}

async function main() {
  try {
    await parseCatalog()
  } catch(e) {
    console.log(e)
  }
}

main()
