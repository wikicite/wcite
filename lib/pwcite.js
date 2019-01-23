/**
 * Implements the pwcite script.
 */
const Bibliography = require('./bibliography')
const { cite, pandoc, wikidata } = require('./util')
const { metadata, metavalues, walk } = pandoc
const { isQid } = wikidata

function walkCitations (doc, citeAction) {
  let action = (type, value) => {
    if (type === 'Cite') {
      value[0].forEach(citeAction)
    }
  }
  walk(doc, action)
}

function qidCitekeys (citekeys) {
  return Object.keys(citekeys).map(key => citekeys[key]).filter(isQid)
}

/**
 * Extract citekeys from metadata fields `citekeys` and `nocite` and from
 * Wikidata identifiers used as citation identifiers in the document.
 */
function extractCitekeys (doc) {
  let { nocite, citekeys } = metavalues(doc)
  citekeys = citekeys || {}
  walkCitations([doc, nocite], c => {
    let id = c.citationId
    if (!(id in citekeys)) {
      citekeys[id] = isQid(id) ? id : ''
    }
  })

  return citekeys
}

function replaceCitekeys (doc, citekeys) {
  citekeys = citekeys || extractCitekeys(doc)

  let nocite = metavalues(doc, 'nocite')

  walkCitations([doc, nocite], c => {
    c.citationId = citekeys[c.citationId] || c.citationId
  })
}

/**
 * The actual Pandoc filter.
 */
function filter (root, format, meta) {
  let bibliography = metavalues(root, 'bibliography')
  let citekeys = extractCitekeys(root)

  if (Array.isArray(bibliography)) {
    bibliography = bibliography.first(f => f.match(/\.json$/))
  }

  if (bibliography && bibliography.match(/.json/)) {
    let refs = new Bibliography(bibliography)

    let qids = qidCitekeys(citekeys)
    qids = qids.filter(id => !refs.get(id)) // missing refs

    cite.get(qids).forEach(record => refs.add(record))

    if (refs.modified) {
      refs.save()
    }
  } else {
    let refs = []
    let qids = qidCitekeys(citekeys)

    cite.get(qids).forEach(record => refs.push(record))
    meta.references = metadata(refs)
  }

  replaceCitekeys(root, citekeys)

  if (format.match(/^html/)) {
    require('./inject-wikidata-links')(meta)
  }

  return root
}

module.exports = {
  extractCitekeys,
  replaceCitekeys,
  filter,
  run: args => pandoc.filter(filter, args)
}
