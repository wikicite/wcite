/**
 * Implements the pwcite script.
 */
const wcite = require('./wcite')
const { pandoc } = require('./util')
const { metadata, metavalues, walk } = pandoc

/**
 * Process each citation in a Pandoc document in-place.
 */
function processCitations (doc, action) {
  const nocite = metavalues(doc, 'nocite')

  walk([doc, nocite], (type, value) => {
    if (type === 'Cite') {
      value[0].forEach(action)
    }
  })
}

/**
 * Extract citekeys from metadata fields `citekeys` and `nocite` and from
 * Wikidata identifiers used as citation identifiers in the document.
 */
function getCitekeys (doc) {
  let citekeys = metavalues(doc, 'citekeys') || {}

  processCitations(doc, c => {
    if (!(c.citationId in citekeys)) {
      citekeys[c.citationId] = true
    }
  })

  return citekeys
}

/**
 * Replace citation keys in a document.
 */
function replaceCitekeys (doc, citekeys) {
  processCitations(doc, c => {
    const key = citekeys[c.citationId]
    if (typeof key === 'string' && key !== '') {
      c.citationId = citekeys[c.citationId]
    }
  })
}

/**
 * The actual Pandoc filter.
 */
function filter (root, format, meta) {
  let { bibliography, nocite } = metavalues(root)
  if (Array.isArray(bibliography)) {
    bibliography = bibliography.first(f => f.match(/\.json$/))
  } else if (bibliography && !bibliography.match(/.json$/)) {
    bibliography = undefined
  }

  let citekeys = getCitekeys(root)

  // TODO: set output to quiet or specify logfile?
  let out = process.stderr
  let cite = wcite({ bibliography, citekeys, nocite, out })

  let missing = Object.keys(cite.doc.citekeys).filter(id => cite.doc.citekeys[id] === false)
  cite.add(missing)

  if (!bibliography) {
    let refs = cite.doc.bibliography.references
    refs = Object.keys(refs).reduce((arr, key) => { // Object.values
      arr.push(refs[key])
      return arr
    }, [])
    meta.references = metadata(refs)
  }

  replaceCitekeys(root, citekeys)

  if (format.match(/^html/)) {
    require('./inject-wikidata-links')(meta)
  }

  return root
}

module.exports = {
  processCitations,
  getCitekeys,

  replaceCitekeys,
  filter,
  run: args => pandoc.filter(filter, args)
}
