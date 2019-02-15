/**
 * Wrapper around citation-js.
 */

// polyfill required by citation-js 0.4.0-11 with Node 6
if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj)

    var i = ownProps.length

    var resArray = new Array(i) // preallocate the Array
    while (i--) { resArray[i] = [ownProps[i], obj[ownProps[i]]] }
    return resArray
  }
}

// polyfill required by citation-js 0.4.0-11 with Node 6 
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart (targetLength, padString) { // eslint-disable-line
    targetLength = targetLength >> 0 // truncate if number, or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ')
    if (this.length >= targetLength) {
      return String(this)
    } else {
      targetLength = targetLength - this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length) // append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this)
    }
  }
}

// require citation-js only if needed and mute logging
function withCite (action) {
  const { write } = process.stderr
  process.stderr.write = () => {}
  const Cite = require('citation-js')
  const result = action(Cite)
  process.stderr.write = write
  return result
}

module.exports = {

  get: (ids, options = {}) => withCite(cite => {
    return (cite(ids, options) || { get: () => [] }).get()
  }),

  format: (data, options = {}) => withCite(cite => {
    const { format, lang, template } = options

    if (format === 'bibtex') {
      return cite.plugins.output.format('bibtex', data)
    } else if (format === 'ndjson') {
      return data.map(item => JSON.stringify(item) + '\n').join('')
    } else if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else { // text or html
      let options = { format, lang, template }
      if (format === 'text') {
        options['prepend'] = item => `${item.id}: `
      }
      return cite.plugins.output.format('bibliography', data, options)
    }
  })
}
