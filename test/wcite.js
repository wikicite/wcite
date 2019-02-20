/* eslint-env mocha */
const { should, pkgfile, outstream } = require('./util')
const { wcite } = require('../index')

const example = file => pkgfile(`examples/${file}`)
const output = (opts, cmd, ...args) => {
  opts.out = outstream()
  opts.err = opts.out
  wcite(opts)[cmd](...args)
  return should(opts.out.data)
}

describe('wcite', () => {
  // constructor

  it('reads document and/or bibliography', () => {
    let document = pkgfile('home/wcite.md')
    let bibliography = pkgfile('home/references.json')
    let cite1 = wcite({ document })
    let cite2 = wcite({ bibliography })
    should.deepEqual(cite1.doc.bibliography.ids(), cite2.doc.bibliography.ids())
  })

  it('complains on missing YAML header', () => {
    should(() => { wcite({ document: example('minimal.md') }) }).throw()
  })

  // list

  it('lists ids from bibliography file', () => {
    let bibliography = example('nocite-refs.json')
    output({ bibliography }, 'list').equal('Q55239420\n')
  })

  it('lists ids and aliases from document', () => {
    let document = example('example.md')
    output({ document }, 'list').equal('Vrand04: Q18507561\nQ2013\n')
  })

  it('lists ids and aliases from document and bibliography', () => {
    let bibliography = example('nocite-refs.json')
    let document = example('citeall.yaml')
    output({ document, bibliography }, 'list').equal('Vrand04: Q18507561\nQ2013\nQ55239420\n')
  })

  // add

  it('does not add existing item', () => {
    let bibliography = example('nocite-refs.json')
    output({ bibliography }, 'add', ['Q55239420']).equal('Q55239420 already added\n')
  })

  it('supports aliases to add items', () => {
    let bibliography = example('nocite-refs.json')
    let citekeys = { Frankenstein: 'Q55239420' }
    output({ bibliography, citekeys }, 'add', ['Frankenstein']).equal('Frankenstein already added\n')
  })
})
