/**
 * Implements the wcite script.
 */
const cite = require('./util/cite')
const { isQid } = require('./util/wikidata')
const Writer = require('./writer')
const Document = require('./document')
require('./util/object-entries')

class WCite extends Writer {
  constructor (opts = {}) {
    super(opts)

    this.doc = new Document(opts)
    
    this.all = opts.all
    this.language = opts.language || 'en'
    this.format = opts.format || 'text'
    this.template = opts.template || 'apa'
  }

  list () {
    const { citekeys, bibliography, aliases } = this.doc

    // FIXME: show/hide missing items

    for (let id in citekeys) {
      if (typeof citekeys[id] !== 'boolean') {
        this.say(id + ': ' + citekeys[id])
      } else if (!(id in aliases)) {
        this.say(id)
      }
    }

    for (let id of bibliography.ids().filter(id => !(id in aliases))) {
      this.say(id)
    }
  }

  show (ids) {
    const { format, language, template } = this
    const { citekeys, bibliography, aliases } = this.doc

    if (ids.length) {
      ids = this.filterQids(ids)
    } else {
      ids = bibliography.ids()
    }

    let data = []
    if (bibliography.file) {
      data = ids.map(id => {
        let record = bibliography.get(id, citekeys)
        if (!record) {
          this.warn(`${id} not found!`)
        }
        return record
      }).filter(Boolean)
    } else {
      // if no file specified, get via Wikidata
      data = cite.get(ids, { output: { lang: language } })
    }

    data.forEach(item => {
      item['citation-label'] = aliases[item.id] || item.id
    })

    if (data.length) {
      this.say(cite.format(data, { format, lang: language, template }))
    }
  }

  filterQids(ids) {
    const { citekeys } = this.doc
    return ids.map(id => citekeys[id] || id).filter(id => {
      if (isQid(id)) return true
      this.warn(`'${id}' is no Wikidata item identifier`)
    })
  }

  add (ids) {
    ids = this.filterQids(ids) 
    if (ids.length) {
      // TODO: add citekeys via citation-js's getBibTeXLabel
      const { bibliography } = this.doc

      let data = cite.get(ids, { output: { lang: this.language } })
      data.forEach(record => {
        let action = bibliography.get(record.id) ? 'updated' : 'added'
        if (!bibliography.add(record)) {
          action = 'unmodified'
        }
        this.log(`${record.id} ${action}`)
      })

      if (bibliography.modified) {
        bibliography.save()
      }
    }
  }

  update (ids) {
    const { bibliography, citekeys } = this.doc
    if (ids && ids.length) {
      ids = ids.map(id => {
        if (bibliography.get(id, citekeys)) {
          return citekeys[id] === true ? id : citekeys[id]
        } else {
          this.warn(`'${id}' not found!`)
        }
      }).filter(Boolean)
    } else {
      ids = bibliography.ids()
    }
    this.add(ids)
  }
}

module.exports = (...args) => new WCite(...args)
