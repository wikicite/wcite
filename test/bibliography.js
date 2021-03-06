/* eslint-env mocha */
const { should, tempfile, pkgfile, fs } = require('./util')
const { Bibliography } = require('../index')

describe('Bibliography', () => {
  let refs = new Bibliography(tempfile())
  let item = { id: 'Q1' }

  it('add', () => {
    should(refs.add(item)).be.true()
    should(refs.add(item)).be.false()
    should.deepEqual(refs.get('Q1'), item)
    should(refs.modified).be.true()
  })

  it('ids', () => {
    should.deepEqual(refs.ids(), ['Q1'])
  })

  it('get', () => {
    should.deepEqual(refs.get('Q1'), item)
    should.deepEqual(refs.get('x', { x: 'Q1' }), item)
  })

  it('save', () => {
    refs.save()
    should(fs.existsSync(refs.file)).be.true()
    should(refs.modified).be.false()
  })

  it('load', () => {
    refs = new Bibliography(refs.file)
    should(refs.modified).be.false()
    should.deepEqual(refs.get('Q1'), item)
  })

  it('remove', () => {
    should(refs.remove('Q9')).be.undefined()
    should(refs.modified).be.false()
    should(refs.remove('Q1')).be.true()
    should(refs.modified).be.true()
    should(refs.get('Q1')).be.undefined()
  })

  it('exception', () => {
    let file = pkgfile('package.json')
    should(() => new Bibliography(file).throw())
  })

  it('in-memory', () => {
    refs = new Bibliography()
    should(refs.modified).be.false()
  })

  it('add (deep equal)', () => {
    refs.add({ id: 'Q1', title: 'foo' })
    should(refs.add({ title: 'foo', id: 'Q1' })).be.false()
  })
})
