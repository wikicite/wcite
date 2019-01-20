/**
 * Wrapper around citation-js to only require it when needed.
 */
var Cite

module.exports = (id, options = {}) => {
  Cite = Cite || require('citation-js')
  var data = new Cite(id, options)
  if (data) return data.get()[0]
}
