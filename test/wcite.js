/* eslint-env mocha */
const { should, pkgfile } = require('./util')
const { wcite } = require('../index')

describe('wcite', () => {
  let document = pkgfile('home/index.md')
  let bibliography = pkgfile('home/references.json')

  it('read document and/or bibliography', () => {
    let cite1 = wcite({ document })
    let cite2 = wcite({ bibliography })
    should.deepEqual(cite1.bibliography.ids(), cite2.bibliography.ids())
  })

  // ...
})
