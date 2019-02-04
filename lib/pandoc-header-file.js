const yaml = require('yaml')
const fs = require('fs')
const { resolve, dirname } = require('path')

class PandocHeaderFile {
  constructor (path) {
    this.path = path
    this.parse(fs.readFileSync(path, { encoding: 'utf8' }))
  }

  parse (content) {
    if (content.substr(0, 3) === '---') {
      const parts = content.split(/^\.\.\./m)
      this.header = yaml.parse(parts.shift())
      this.body = parts.join('...')
    } else {
      throw new Error(`file ${this.path} must start with ---`)
    }
  }

  write () {
    let content = this.header
      ? ['---\n' + yaml.stringify(this.header)] : []
    if (this.body !== undefined) content.push(this.body)
    fs.writeFileSync(content.join('...\n'))
  }

  bibliography () {
    let file = (this.header || {}).bibliography

    file = (Array.isArray(file) ? file : [file])
      .find(f => typeof f === 'string' && f.match(/\.json$/))

    if (file) {
      return resolve(dirname(this.path), file)
    }
  }

  nocite () {
    let nocite = (this.header || {}).nocite
    if (typeof nocite === 'string') {
      return nocite.match(/@(\*|[a-z0-9_][a-z0-9_:.#$%&+?<>~\/-]*)/ig)
        .map(citekey => citekey.substr(1))
    }
  }
}

module.exports = path => new PandocHeaderFile(path)
