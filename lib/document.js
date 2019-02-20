const YamlHeaderFile = require('./yaml-header-file')
const Bibliography = require('./bibliography')
const { resolve, dirname } = require('path')
const { isQid } = require('./util/wikidata')

const { citekeyPattern } = require('./util/pandoc')
const asArray = value => Array.isArray(value) ? value : [value]

/**
 * Holds a bibliography, a citekeys object, and a nocite set,
 * optionally read from a YAML header file.
 */
class Document {
  constructor (fields = {}) {
    let { document, bibliography, citekeys, nocite } = fields

    if (document !== undefined) {
      this.file = new YamlHeaderFile(document)
      let meta = this.file.header || {}

      if (!bibliography && meta.bibliography) {
        let file = asArray(meta.bibliography).find(f => typeof f === 'string' && f.match(/\.json$/))
        if (file) {
          bibliography = resolve(dirname(this.file.file), file)
        }
      }

      if (!citekeys && typeof meta.citekeys === 'object') {
        citekeys = Object.assign({}, meta.citekeys)
      }

      if (!nocite && typeof meta.nocite === 'string') {
        nocite = new Set(meta.nocite.match(citekeyPattern).map(key => key.substr(1)))
      }
    }

    bibliography = new Bibliography(bibliography)

    nocite = nocite || new Set()

    let aliases = {}

    // normalize citekeys and calculate aliases
    if (citekeys) {
      for (let key in citekeys) {
        let value = citekeys[key]
        if (isQid(key) && (value === key || !value || value === true)) {
          citekeys[key] = !!bibliography.get(key)
        } else if (isQid(value)) {
          aliases[value] = key
          citekeys[key] = value
          citekeys[value] = !!bibliography.get(value)
        } else {
          delete citekeys[key]
        }
      }
    } else {
      citekeys = {}
    }

    // add citekeys included in nocite
    Array.from(nocite).filter(isQid).filter(id => !(id in citekeys))
      .forEach(id => { citekeys[id] = !!bibliography.get(id) })

    Object.assign(this, { nocite, citekeys, bibliography, aliases })
  }

  identifiers (ids, missing) {
    const { bibliography, citekeys } = this

    if (ids && ids.length) {
      let found = {}
      ids = ids.map(id => {
        if (bibliography.get(id, citekeys)) {
          return typeof citekeys[id] === 'string' ? citekeys[id] : id
        } else if (missing) {
          missing(id)
        }
      }).filter(Boolean)
        // remove duplicates
        .filter(id => {
          if (id in found) { return false } else { found[id] = true; return true }
        })
    } else {
      ids = bibliography.ids()
    }

    return ids
  }
}

module.exports = Document
