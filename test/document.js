/* eslint-env mocha */
const { should, pkgfile, path } = require('./util')
const Document = require('../lib/document')
const Bibliography = require('../lib/bibliography')

describe('Document', () => {
  it('can be an in-memory document', () => {
    let doc = new Document()
    should(doc.bibliography).deepEqual(new Bibliography())
    should(doc.nocite).deepEqual(new Set())
    should(doc.citekeys).deepEqual({})
    should(doc.aliases).deepEqual({})
  })

  it('reads bibliography field', () => {
    let file = pkgfile('examples/citekeys.yaml')
    let doc = new Document({ document: file })
    let bibliography = path.resolve(path.dirname(file), 'citekeys.json')
    should(doc.bibliography.file).equal(bibliography)
  })

  it('reads citekeys field', () => {
    let doc = new Document({ document: pkgfile('examples/citeall.yaml') })
    should(doc.nocite).deepEqual(new Set(['*', 'Q2013']))
    should(doc.citekeys).deepEqual({ Q18507561: false, Vrand04: 'Q18507561', Q2013: false })
    should(doc.aliases).deepEqual({ Q18507561: 'Vrand04' })
  })

  it('reads nocite field', () => {
    let doc = new Document({ document: pkgfile('examples/nocite.md') })
    should(doc.nocite).deepEqual(new Set(['foo', 'Q55239420']))
  })

  it('normalizes citekeys', () => {
    let doc = new Document({ citekeys: { a: 'Q1', Q2: true, x: 1 } })
    should(doc.citekeys).deepEqual({ a: 'Q1', Q2: false, Q1: false })
    should(doc.aliases).deepEqual({ Q1: 'a' })
  })

  it('adds nocite to citekeys', () => {
    let doc = new Document({ document: pkgfile('examples/example.md') })
    should(doc.citekeys).deepEqual({ Q18507561: false, Vrand04: 'Q18507561', Q2013: false })
    should(doc.aliases).deepEqual({ Q18507561: 'Vrand04' })
  })
})
