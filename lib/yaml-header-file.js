const yaml = require('yaml')
const fs = require('fs')

/**
 * Read and write a YAML file or file with YAML header.
 */
class YamlHeaderFile {
  constructor (file) {
    this.file = file
    this.parse(fs.readFileSync(file, { encoding: 'utf8' }))
  }

  parse (content) {
    if (content.substr(0, 3) === '---') {
      const parts = content.split(/^\.\.\./m)
      this.header = yaml.parse(parts.shift())
      this.body = parts.join('...')
    } else {
      throw new Error(`file ${this.file} must start with ---`)
    }
  }

  write () {
    let content = this.header
      ? ['---\n' + yaml.stringify(this.header)] : []
    if (this.body !== undefined) content.push(this.body)
    fs.writeFileSync(this.file, content.join('...\n'))
  }
}

module.exports = YamlHeaderFile
