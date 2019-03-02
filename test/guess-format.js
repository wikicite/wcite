/* eslint-env mocha */
const { should } = require('./util')
const guessFormat = require('../lib/guess-format')

describe('guessFormat', () => {
  it('guesses format from filename', () => {
    const examples = {
      'foo.bar.html': 'html',
      'x.json': 'json',
      'x.ndjson': 'ndjson',
      'refs.bib': 'bibtex'
    }
    for (let file in examples) {
      should(guessFormat(file)).equal(examples[file])
    }
    should(guessFormat(undefined)).equal(undefined)
  })
})
