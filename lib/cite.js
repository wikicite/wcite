let Cite // only require when needed

module.exports = id => {
  Cite = Cite || require('citation-js')
  let data = new Cite(id)
  if (data) return data.get()[0]
}
