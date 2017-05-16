// parses the text output of Handbrake title scan into JS data structure
//
// Handbrake output is in text format, which is difficult to work with
// we convert it into structured data for easier consumption
//
// sample title scan:
// + title 1:
//   + Main Feature
//   + vts 1, ttn 1, cells 0->12 (1981425 blocks)
//   + duration: 01:48:55
//
// converts to
// [ { titleNo: 1, mainFeature: true, duration: '01:48:55', children: [] }]


function parseIndentTree(lines, spacesPerIdent) {
  let root = {text: '', children: []}
  let nodestack = [root]
  lines.forEach(line => {
    let matches = line.match(/^(\s*)(.*)/)
    // console.log(matches)
    let indent = matches[1]
    let level = indent.length / spacesPerIdent
    let node = {text: matches[2], children: []}
    if (level + 1 > nodestack.length) throw new Error("parse error, jumping up indentation")
    nodestack = nodestack.slice(0, level + 1)
    let parent = nodestack[nodestack.length - 1]
    parent.children.push(node)
    nodestack.push(node)
  })
  return root
}

function parseChapters(chapterNodes) {
  return chapterNodes.map(node => {
    let result = { }
    let parts = node.text.slice(2).split(',')
    result.chapterNo = parseInt(parts[0].match(/^(.+)?:/)[1])
    result.blocks = parseInt(parts[1].match(/\d+/)[0])
    result.duration = parts[2].match(/\d+:\d+:\d+/)[0]
    return result
  })
}

function parseSubtitleTracks(subtitleNodes) {
  return subtitleNodes.map(node => {
    let result = { }
    let parts = node.text.slice(2).split(',')
    result.trackNo = parseInt(parts[0])
    result.spec = parts[1].trim()
    return result
  })
}

function parseAudioTracks(audioNodes) {
  return audioNodes.map(node => {
    let result = { }
    let parts = node.text.slice(2).split(',')
    result.trackNo = parseInt(parts[0])
    result.spec = parts[1].trim()
    // result.frequency = parts[2].trim()
    // result.bitRate = parts[3].trim()
    return result
  })
}

function parseTitles(titleNodes) {
  function getKeyVal(str) {
    let matches = str.match(/(.+?):(.+)/)
    return { key: matches[1].trim(), val: matches[2].trim() }
  }

  let titles = titleNodes.map(node => {
    let result = { mainFeature: false, combing: false }
    result.titleNo = parseInt(node.text.slice(2).match(/title (.+)/)[1])
    node.children.forEach(child => {
      let childText = child.text.slice(2)
      if (childText === 'Main Feature') {
        result.mainFeature = true
        return
      }
      if (childText.startsWith('vts ')) return
      if (childText.startsWith('combing detected')) {
        result.combing = true
        return
      }
      if (childText.startsWith('size: ')) {
        let parts = childText.split(',')
        result.size = getKeyVal(parts[0]).val
        result.pixelAspect = getKeyVal(parts[1]).val
        result.displayAspect = getKeyVal(parts[2]).val
        result.fps = parts[3].trim().match(/\S+/)[0]
        return
      }
      if (childText.startsWith('chapters:')) {
        result.chapters = parseChapters(child.children)
        return
      }
      if (childText.startsWith('audio tracks:')) {
        result.audioTracks = parseAudioTracks(child.children)
        return
      }
      if (childText.startsWith('subtitle tracks:')) {
        result.subtitleTracks = parseSubtitleTracks(child.children)
        return
      }
      let keyval = getKeyVal(childText)
      if (keyval.val.length === 0) throw new Error("No value parsed")
      result[keyval.key] = keyval.val
    })
    return result
  })
  return titles
}


function parse(scantext) {
  scantext = scantext.replace(/\r\n|\n\r/g, '\n')
  let treedatastr = scantext.match(/(\n\s*\+.*)+/)[0]
  let lines = treedatastr.split('\n').slice(1)
  let tree = parseIndentTree(lines, 2)
  let titles = parseTitles(tree.children)
  // console.log(JSON.stringify(titles, null, ' '))
  // console.log(JSON.stringify(tree.children, null, ' '))
  // console.log(lines)
  return titles
}

exports.parse = parse
