/**
 * Implements the wcite script.
 */
const cite = require('./cite')
const Bibliography = require('./bibliography')

module.exports = args => {
  if (!args.length) return

  let file = args.shift()
  let refs = new Bibliography(file)

  if (!args.length) {
    for (let id in refs.references) {
      console.log(id)
    }
  } else if (args[0] === 'update') {
    args.shift()
    let ids = args.length ? args : Object.keys(refs.references)
    ids.forEach(id => {
      let data = cite(id)
      if (data) {
        refs.add(data)
        console.log(id)
      } else {
        console.error(`${id} not found`)
      }
    })
    if (refs.modified) {
      refs.save()
    }
  }
}
