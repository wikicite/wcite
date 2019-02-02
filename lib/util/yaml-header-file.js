const yaml = require('yaml')
const fs = require('fs')

class YamlHeaderFile {
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
}

module.exports = path => new YamlHeaderFile(path)
