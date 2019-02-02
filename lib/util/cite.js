/**
 * Wrapper around citation-js to only require it when needed.
 */
var Cite

const requireCite = () => (Cite = Cite || require('citation-js'))

module.exports = {

  get: (ids, options = {}) =>
    (new (requireCite())(ids, options) || { get: () => [] }).get(),

  format: (data, options = {}) =>
    requireCite().plugins.output.format('bibliography', data, options)
}
