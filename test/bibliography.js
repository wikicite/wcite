const should = require("should")
const fs = require("fs")
const os = require("os")
const Bibliography = require("../lib/bibliography")

function tempfile() {
  return os.tmpdir() + '/' + Math.random().toString(36).substring(2) + '.json'
}

describe('Bibliography', () => {
  let refs = new Bibliography(tempfile())
  let item = {id: 'Q1'}

  it("add", () => {
    refs.add(item)
    should.deepEqual(refs.get('Q1'), item)
  })

  it("save", () => {
    refs.save()
    should(fs.existsSync(refs.file)).be.true()
  })

  it("load", () => {
    refs = new Bibliography(refs.file)
    should.deepEqual(refs.get('Q1'), item)
  })
})
