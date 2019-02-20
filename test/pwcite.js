/* eslint-env mocha */
const { should, pkgfile, fs } = require('./util')
const { pwcite } = require('../index')

const jsonfile = file => JSON.parse(fs.readFileSync(pkgfile(file)))

describe('pwcite', () => {
  let doc = jsonfile('examples/example.json')

  it('processCitations', () => {
    let result = []
    pwcite.processCitations(doc, c => {
      result.push(c.citationMode.t, c.citationId)
    })
    should(result).deepEqual(['NormalCitation', 'Vrand04', 'AuthorInText', 'Q2013'])
  })

  it('getCitekeys', () => {
    let examples = {
      'minimal': { Q18507561: true },
      'example': { Vrand04: 'Q18507561', 'Q2013': true },
      'nocite': { Q55239420: true, foo: true }
    }

    for (let name in examples) {
      it(name, () => {
        let doc = jsonfile(`examples/${name}.json`)
        let keys = pwcite.getCitekeys(doc)
        should(keys).deepEqual(examples[name])
      })
    }
  })
})
