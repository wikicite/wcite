const asset = require('./util/asset')
const { RawBlock, metavalues } = require('./util/pandoc')

module.exports = meta => {
  let wikidataLinks = metavalues(meta, 'wikidata-links')
  if (!wikidataLinks) return

  let script = asset('wikidata-links.js')
  let css = asset('wikidata-links.css')

  if (wikidataLinks === true) {
    wikidataLinks = 'http://www.wikidata.org/entity/'
  } else {
    script = script.replace('http://www.wikidata.org/entity/', wikidataLinks)
  }

  let headers = [
    RawBlock('html', `<script>${script}</script>`),
    RawBlock('html', `<style type="text/css">${css}</style>`)
  ]

  // TODO: keep existing header-includes
  meta['include-after'] = { t: 'MetaBlocks', c: headers }
}
