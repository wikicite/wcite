/**
 * Wrapper around citation-js.
 */

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
