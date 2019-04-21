/**
 * Implements the wcite script.
 */
const cite = require('./util/cite')
const { isQid } = require('./util/wikidata')
const Writer = require('./writer')
const Document = require('./document')
const guessFormat = require('./guess-format')
const fs = require('fs')

class WCite extends Writer {
  constructor (opts = {}) {
    const { output } = opts
    if (output && output !== '-') {
      opts.out = fs.createWriteStream(output)
    }
    super(opts)

    this.doc = new Document(opts)

    this.all = opts.all
    this.languages = (opts.language || '').split(/[, ]+/)
    this.format = opts.format || guessFormat(output) || 'text'
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

  getItems (ids) {
    const { bibliography, aliases } = this.doc
    const { languages } = this

    let data
    if (bibliography.file) {
      data = this.records(ids)
    } else {
      // if no file specified, get via Wikidata
      // TODO: support aliases
      data = cite.get(ids, { languages })
    }

    data.forEach(item => {
      item['citation-label'] = aliases[item.id] || item.id
    })

    return data
  }

  show (ids) {
    const { format, languages, template } = this
    const data = this.getItems(ids)
    if (data.length) {
      this.say(cite.format(data, format, { languages, template }))
    }
  }

  get (ids) {
    this.show(ids)
  }

  add (ids, update = false) {
    const { citekeys, bibliography, languages } = this.doc

    ids = ids.filter(id => {
      if (!update && bibliography.get(id, citekeys)) {
        this.warn(`${id} already added`)
        return false
      }
      if (!isQid(typeof citekeys[id] === 'string' ? citekeys[id] : id)) {
        id = citekeys[id] || id
        this.warn(`'${id}' is no Wikidata item identifier`)
        return false
      }
      return true
    })
      .map(id => typeof citekeys[id] === 'string' ? citekeys[id] : id)

    if (ids.length) {
      // TODO: add citekeys via citation-js's getBibTeXLabel

      let data = cite.get(ids, { languages })
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
    return this.add(this.identifiers(ids), true)
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
