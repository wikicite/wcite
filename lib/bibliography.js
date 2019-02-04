/**
 * Implements a file store of CSL records.
 */
const fs = require('fs')
const normalize = require('./util/sort-keys')

class Bibliography {
  constructor (file) {
    this.file = file
    this.load()
  }

  load () {
    this.references = {}
    this.modified = false

    if (this.file) {
      if (fs.existsSync(this.file)) {
        let json = fs.readFileSync(this.file, 'utf-8')
        if (json.match(/^\s*\[/m)) {
          JSON.parse(json).forEach(item => this.add(item))
        } else {
          throw new Error(`file ${this.file} must contain a JSON array`)
        }
        this.modified = false
      } else {
        this.modified = true
      }
    }
  }

  add (item) {
    if (JSON.stringify(item) !== JSON.stringify(this.references[item.id])) {
      this.references[item.id] = item
      this.modified = true
    }
  }

  get (id, citekeys = {}) {
    return this.references[id] || this.references[citekeys[id]]
  }

  save () {
    if (this.file) {
      let refs = this.ids().map(id => normalize(this.references[id]))
      fs.writeFileSync(this.file, JSON.stringify(refs, null, 2))
      this.modified = false
    }
  }

  ids () {
    return Object.keys(this.references).sort()
  }
}

module.exports = Bibliography
