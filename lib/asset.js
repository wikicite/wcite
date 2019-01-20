/**
 * Provide asset files as cached strings.
 */
const fs = require('fs')
const path = require('path')

const assets = {}

module.exports = name => {
  if (!(name in assets)) {
    const file = path.resolve(__dirname, '..', 'assets', name)
    assets[name] = fs.readFileSync(file).toString()
  }
  return assets[name]
}
