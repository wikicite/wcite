/**
 * Implements the wcite script.
 */
const cite = require('./util/cite')
const { isQid } = require('./util/wikidata')
const Bibliography = require('./bibliography')
const Writer = require('./writer')
const pandocHeaderFile = require('./pandoc-header-file')
require('./util/object-entries')

class WCite extends Writer {
  constructor (opts = {}) {
    super(opts)

    let { bibliography, document, citekeys, citeall } = opts

    if (document) {
      document = pandocHeaderFile(document)

      if (!bibliography) {
        bibliography = document.bibliography()
        if (!bibliography) {
          this.warn('Missing YAML field bibliography referencing a JSON file')
        }
      }

      if (!citekeys) {
        citekeys = (document.header || {}).citekeys
      }

      let nocite = document.nocite() || []
      if (nocite.includes('@*')) {
        citeall = true
      } else {
        let qids = nocite.filter(isQid)
        if (qids.length) {
          citekeys = citekeys || {}
          qids.forEach(key => citekeys[key] = key)
        }
      }
    }

    if (citekeys) {
      this.citekeys = citekeys
      this.citeall = citeall
    } else {
      this.citekeys = {}
      this.citeall = true
    }

    this.bibliography = new Bibliography(bibliography)

    this._labels = {}
    if (citekeys) {
      this.citekeys = citekeys
      Object.entries(citekeys).forEach(e => {
        this._labels[e[1]] = e[0]
      })
    }

    this.language = opts.language || 'en'
    this.format = opts.format || 'text'
    this.template = opts.template || 'apa'
  }

  selectedIds (ids) {
    if (!ids || !ids.length) {
      if (this.citeall || !this.citekeys) {
        ids = this.bibliography.ids()
      } else {
        ids = Object.keys(this.citekeys)
      }
    }
    return ids
  }

  list () {
    let ids = this.selectedIds()
    for (let id of ids) {
      if (this.citekeys[id] && this.citekeys[id] !== id) {
        this.say(id + ': ' + this.citekeys[id])
      } else {
        this.say(id)
      }
    }
  }

  show (ids) {
    const { format, language, template } = this
    const lang = language

    ids = this.selectedIds(ids)

    let data = []
    if (this.bibliography.file) {
      data = ids.map(id => {
        let record = this.bibliography.get(id, this.citekeys)
        if (!record) {
          this.warn(`${id} not found!`)
        }
        return record
      }).filter(Boolean)
    } else {
      // if no file specified, get via Wikidata
      data = cite.get(ids, { output: { lang } })
    }

    data.forEach(item => {
      item['citation-label'] = this._labels[item.id] || item.id
    })

    if (data.length) {
      this.say(cite.format(data, { format, lang, template }))
    }
  }

  add (ids) {
    if (ids.length) {
      // TODO: add citekeys via citation-js's getBibTeXLabel

      let bibliography = this.bibliography
      let data = cite.get(ids, { output: { lang: this.language } })
      data.forEach(record => {
        if (bibliography.add(record)) {
          this.log(`${record.id} added`)
        } else {
          this.log(`${record.id} kept`)
        }
      })
  
      if (bibliography.modified) {
        bibliography.save()
      }
    }
  }

  update (ids) {
    ids = this.selectedIds(ids).filter(id => {
      if (this.bibliography.get(id)) {
        return id
      } else {
        this.warn(`${id} not found!`)
      }
    })
    this.add(ids)
  }
}

module.exports = (...args) => new WCite(...args)
