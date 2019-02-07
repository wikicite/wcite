/* eslint-env mocha */
const { should, pkgfile, outstream } = require('./util')
const { wcite } = require('../index')

describe('wcite', () => {
  it('reads document and/or bibliography', () => {
    let document = pkgfile('home/wcite.md')
    let bibliography = pkgfile('home/references.json')
    let cite1 = wcite({ document })
    let cite2 = wcite({ bibliography })
    should.deepEqual(cite1.bibliography.ids(), cite2.bibliography.ids())
  })

  it('lists ids', () => {
    let bibliography = pkgfile('examples/nocite-refs.json')
    let out = outstream()
    let cite = wcite({ bibliography, out })
    cite.list()
    should(out.data).equal('Q55239420\n')
  })
})
