/**
 * Implements the wcite script.
 */
const cite = require('./util/cite')
const { isQid } = require('./util/wikidata')
const Writer = require('./writer')
const Document = require('./document')

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
    const { bibliography, aliases } = this.doc

    let data
    if (bibliography.file) {
      data = this.records(ids)
    } else {
      // if no file specified, get via Wikidata
      ids = this.identifiers(ids) // aliases may exist nevertheless
      data = cite.get(ids, { output: { lang: language } })
    }

    data.forEach(item => {
      item['citation-label'] = aliases[item.id] || item.id
    })

    if (data.length) {
      this.say(cite.format(data, { format, lang: language, template }))
    }
  }

  add (ids) {
    const { citekeys, bibliography } = this.doc

    ids = ids.map(id => citekeys[id] || id).filter(id => {
      if (isQid(id)) return true
      this.warn(`'${id}' is no Wikidata item identifier`)
    })

    if (ids.length) {
      // TODO: add citekeys via citation-js's getBibTeXLabel

      let data = cite.get(ids, { output: { lang: this.language } })
      data.forEach(record => {
        let action = bibliography.get(record.id) ? 'updated' : 'added'
        if (!bibliography.add(record)) {
          action = 'unmodified'
        }
        this.log(`${record.id} ${action}`)
      })

      bibliography.save()
    }
  }

  remove (ids) {
    const { bibliography } = this.doc
    this.identifiers(ids).forEach(id => {
      if (bibliography.remove(id)) {
        this.log(`${id} removed`)
      }
    })
    bibliography.save()
  }

  update (ids) {
    return this.add(this.identifiers(ids))
  }

  identifiers (ids) {
    const missing = id => this.warn(`${id} not found!`)
    return this.doc.identifiers(ids, missing)
  }

  records (ids) {
    const { bibliography, citekeys } = this.doc
    ids = this.identifiers(ids)
    return ids.map(id => bibliography.get(id, citekeys))
  }
}

module.exports = (...args) => new WCite(...args)
