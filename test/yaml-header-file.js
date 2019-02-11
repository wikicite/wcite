/* eslint-env mocha */
const { should, pkgfile } = require('./util')
const YamlHeaderFile = require('../lib/yaml-header-file')

describe('YamlHeaderFile', () => {
  it('reads a YAML file', () => {
    let loc = pkgfile('examples/citekeys.yaml')
    let file = new YamlHeaderFile(loc)
    should(file.header).deepEqual({
      citekeys: { Scholia: 'Q58484849', Pandoc: 'Q2049294' },
      bibliography: 'citekeys.json'
    })
    should(file.content).equal(undefined)
  })

  it('reads a YAML header file', () => {
    let loc = pkgfile('home/wcite.md')
    let file = new YamlHeaderFile(loc)
    should(file.header).be.ok()
  })
})
