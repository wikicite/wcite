/* eslint-env mocha */
const { should, fs, pkgfile } = require('./util')
const { extractCitekeys } = require('../lib/pwcite')

describe('extract citekeys', () => {
  let examples = {
    'minimal': { Q18507561: 'Q18507561' },
    'example': { Vrand04: 'Q18507561' },
    'nocite': { Q55239420: 'Q55239420', foo: '' }
  }

  for (let name in examples) {
    let file = pkgfile(`examples/${name}.json`)
    it(name, () => {
      let doc = JSON.parse(fs.readFileSync(file))
      let keys = extractCitekeys(doc)
      should(keys).deepEqual(examples[name])
    })
  }
})
