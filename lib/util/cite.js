/**
 * Wrapper around citation-js to retrieve and format bibliographic data.
 */
const { Cite, plugins } = require('@citation-js/core')

module.exports = {

  /**
   * Retrieve bibliographic items via their Wikidata identifiers.
   */
  get: (ids, options = {}) => {
    require('@citation-js/plugin-wikidata')
    plugins.config.get('@wikidata').langs = options.languages
    return (Cite(ids) || { get: () => [] }).get()
  },

  /**
   * Format bibliographic items and return a string.
   */
  format: (items, format, options = {}) => {
    if (format === 'ndjson') {
      return items.map(item => JSON.stringify(item)).join('\n')
    } else if (format === 'json') {
      return JSON.stringify(items, null, 2)
    }

    const cite = new Cite(items)

    if (format === 'bibtex' || format === 'bibtxt') {
      require('@citation-js/plugin-bibtex')
    } else {
      require('@citation-js/plugin-csl')

      options.format = format
      if (format === 'text') {
        options.prepend = item => `${item.id}: `
      } else if (format !== 'html') {
        throw new Error(`unknown citation format ${format}`)
      }

      format = 'bibliography'
    }

    return cite.format(format, options)
  }
}
