/* eslint-env mocha */
const should = require('should')
const fs = require('fs')
const yamlHeaderFile = require('../lib/util/yaml-header-file')

describe('yamlHeaderFile', () => {
  it('YAML file', () => {
    let file = yamlHeaderFile(__dirname + '/../examples/citekeys.yaml')
    should(file.header).deepEqual({
      citekeys: { Scholia: 'Q58484849', Pandoc: 'Q2049294' },
      bibliography: 'refs.json'
    })
    should(file.content).equal(undefined)
  })

  it('YAML header file', () => {
    let file = yamlHeaderFile(__dirname + '/../home/index.md')
    should(file.header).be.ok()
  })
})
