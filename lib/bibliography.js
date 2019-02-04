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
    this.modified = true
    if (fs.existsSync(this.file)) {
      let json = fs.readFileSync(this.file, 'utf-8')
      if (json.match(/^\s*\[/m)) {
        JSON.parse(json).forEach(item => this.add(item))
      }
      this.modified = false
    }
  }

  add (item) {
    this.references[item.id] = item
    this.modified = true
  }

  get (id, citekeys = {}) {
    return this.references[id] || this.references[citekeys[id]]
  }

  save () {
    let refs = Object.keys(this.references)
      .sort().map(id => normalize(this.references[id]))
    fs.writeFileSync(this.file, JSON.stringify(refs, null, 2))
  }
}

module.exports = Bibliography
