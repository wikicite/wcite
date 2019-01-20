const { RawBlock, metadata, metavalues, walk } = require('./pandoc')
const Bibliography = require('./bibliography')
const cite = require('./cite')
const isQid = id => id.match(/^Q[0-9]+$/)
const asset = require('./asset')

function getCitationData (qids, cb) {
  qids.forEach(id => {
    let data = cite(id)
    if (data) {
      cb(data)
    }
  })
}

function loadBibliography (file, citekeys) {
  let refs = new Bibliography(file)

  let qids = qidCitekeys(citekeys)
  qids = qids.filter(id => !refs.get(id)) // missing refs

  getCitationData(qids, data => refs.add(data))

  if (refs.modified) {
    refs.save()
  }
}

function walkCitations (root, citeAction) {
  let action = (type, value) => {
    if (type === 'Cite') {
      value[0].forEach(citeAction)
    }
  }
  walk(root, action)
}

function qidCitekeys (citekeys) {
  return Object.keys(citekeys).map(key => citekeys[key]).filter(isQid)
}

/**
 * Extract citekeys from metadata fields `citekeys` and `nocite` and from
 * Wikidata identifiers used as citation identifiers in the document.
 */
function extractCitekeys (root, meta) {
  meta = Array.isArray(root) ? root[0].unMeta : root.meta
  let { citekeys, nocite } = metavalues(meta)

  citekeys = citekeys || {}
  walkCitations([root, nocite], c => {
    let id = c.citationId
    if (!(id in citekeys)) {
      citekeys[id] = isQid(id) ? id : ''
    }
  })

  return citekeys
}

function replaceCitekeys (doc, citekeys) {
  walkCitations(doc, c => {
    c.citationId = citekeys[c.citationId] || c.citationId
  })
}

/**
 * The actual Pandoc filter.
 */
function filter (root, format, meta) {
  const allMetavalues = metavalues(meta)
  let { citekeys, nocite, bibliography } = allMetavalues
  let wikidataLinks = allMetavalues['wikidata-links']

  citekeys = extractCitekeys(root, meta)

  // load references into bibliography
  if (bibliography) {
    if (!Array.isArray(bibliography)) {
      bibliography = [bibliography]
    }
    let file = bibliography.find(f => f.match(/\.json$/))
    if (file) {
      loadBibliography(file, citekeys)
    } else {
      console.error('no bibliography file specified!')
    }
  } else {
    let refs = []
    let qids = qidCitekeys(citekeys)
    getCitationData(qids, data => refs.push(data))
    meta.references = metadata(refs)
  }

  replaceCitekeys([root, nocite], citekeys)

  if (format === 'html' && wikidataLinks) {
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

  return root
}

module.exports = {
  filter,
  extractCitekeys,
  replaceCitekeys
}
