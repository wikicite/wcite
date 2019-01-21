/**
 * Wrapper around citation-js to only require it when needed.
 */
var Cite

module.exports = (id, options = {}) => {
  Cite = Cite || require('citation-js')
  var data = new Cite(id, options)
  return data ? data.get() : []
}
