const { filter, metadata, walk } = require('./pandoc')
const Bibliography = require('./bibliography')
const cite = require('./cite')
const isQid = id => id.match(/^Q[1-9][0-9]*$/)

function loadBibliography (file, citekeys) {
  let refs = new Bibliography(file)

  let qids = Object.keys(citekeys).map(key => citekeys[key]).filter(isQid)
  qids = qids.filter(id => !refs.get(id)) // missing refs

  qids.forEach(id => {
    let data = cite(id)
    if (data) {
      refs.add(data)
      console.warn(id) // TODO: show citekey and short text
    }
  })

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

/**
 * Extract citekeys from metadata fields `citekeys` and `nocite` and from
 * Wikidata identifiers used as citation identifiers in the document.
 */
function extractCitekeys (root, meta) {
  meta = Array.isArray(root) ? root[0].unMeta : root.meta
  let { citekeys, nocite } = metadata(meta)

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
function wikicite (root, format, meta) {
  let { citekeys, nocite, bibliography } = metadata(meta)

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
  }

  replaceCitekeys([root, nocite], citekeys)

  return root
}

module.exports = {
  executeFilter: args => filter(wikicite, args),
  extractCitekeys,
  replaceCitekeys
}
