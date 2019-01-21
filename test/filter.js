/* eslint-env mocha */
const should = require('should')
const fs = require('fs')
const { extractCitekeys } = require('../lib/pwcite')

describe('extract citekeys', () => {
  let examples = {
    'minimal': { Q18507561: 'Q18507561' },
    'example-1': { Vrand04: 'Q18507561' }
  }

  for (let name in examples) {
    let file = `examples/${name}.json`
    it(name, () => {
      let doc = JSON.parse(fs.readFileSync(file))
      let keys = extractCitekeys(doc)
      should(keys).deepEqual(examples[name])
    })
  }
})
