/* eslint-env mocha */
const { should, pkgfile, fs, path } = require('./util')
const pandocHeaderFile = require('../lib/pandoc-header-file')

describe('pandocHeaderFile', () => {
  it('reads a YAML file', () => {
    let loc = pkgfile('examples/citekeys.yaml')
    let file = pandocHeaderFile(loc)
    should(file.header).deepEqual({
      citekeys: { Scholia: 'Q58484849', Pandoc: 'Q2049294' },
      bibliography: 'citekeys.json'
    })
    should(file.content).equal(undefined)

    let bibliography = path.resolve(path.dirname(loc), 'citekeys.json')
    should(file.bibliography()).equal(bibliography)
  })

  it('reads a YAML header file', () => {
    let loc = pkgfile('home/index.md')
    let file = pandocHeaderFile(loc)
    should(file.header).be.ok()

    let bibliography = path.resolve(path.dirname(loc), 'references.json')
    should(file.bibliography()).equal(bibliography)
  })

  it('reads nocite field', () => {
    let file = pandocHeaderFile(pkgfile('examples/nocite.md'))
    should(file.nocite()).deepEqual(['foo', 'Q55239420'])
  })
})
