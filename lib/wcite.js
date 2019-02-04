/**
 * Implements the wcite script.
 */
const cite = require('./util/cite')
const { isQid } = require('./util/wikidata')
const Bibliography = require('./bibliography')
const pandocHeaderFile = require('./pandoc-header-file')
require('./util/object-entries')

const path = require('path')

class WCite {
  constructor (opts = {}) {
    let { bibliography, document, citekeys } = opts

    if (document) {
      document = pandocHeaderFile(document)

      if (!bibliography) {
        bibliography = document.bibliography()
        if (!bibliography) {
          console.warn('Missing YAML field bibliography referencing a JSON file')
        }
      }

      if (!citekeys) {
        citekeys = (document.header || {}).citekeys
      }

      let nocite = document.nocite() || []
      if (nocite.includes('@*')) {
        this.citeall = true
      } else {
        citekeys = citekeys || {}
        nocite.filter(isQid).forEach(key => citekeys[key] = key)
      }
    }

    this.bibliography = new Bibliography(bibliography)

    this._labels = {}
    if (citekeys) {
      this.citekeys = citekeys
      Object.entries(citekeys).forEach(e => {
        this._labels[e[1]] = e[0]
      })
    }

    // options
    this.language = opts.language || 'en'
    this.format = opts.format || 'text'
    this.template = opts.template || 'apa'
  }

  show (ids) {
    const { format, language, template } = this
    const lang = language

    if (!ids.length) {
      ids = this.bibliography.ids()
    }

    // if no file specified, get via Wikidata
    let data = []
    if (this.bibliography.file) {
      data = ids.map(id => this.bibliography.get(id)).filter(Boolean)
    } else {
      data = cite.get(ids, { output: { lang } })
    }

    data.forEach(item => {
      item['citation-label'] = this._labels[item.id] || item.id
    })

    if (data.length) {
      console.log(cite.format(data, { format, lang, template }))
    }
  }

  list () {
    // TODO: respect citekeys/nocite
    for (let id of this.bibliography.ids()) {
      id = this._labels[id]
        ? this._labels[id] + ': ' + id
        : id + ':'
      console.log(id)
    }
  }

  add (ids) {
    if (ids.length) {
      this.update(ids)
    }
  }

  update (ids) {
    // TODO: respect citekeys/nocite
    if (!ids.length) {
      ids = this.bibliography.ids()
    }
    let bibliography = this.bibliography
    let data = cite.get(ids, { output: { lang: this.language } })
    data.forEach(record => bibliography.add(record))

    // TODO: add citekeys via citation-js's getBibTeXLabel

    if (bibliography.modified) {
      bibliography.save()
    }
  }
}

module.exports = (...args) => new WCite(...args)
