/**
 * Implements the wcite script.
 */
const cite = require('./cite')
const Bibliography = require('./bibliography')
const Cite = require('citation-js')

class WCite extends Bibliography {
  constructor (args) {
    // called without arguments
    if (!args.length) {
      args = ['help']
    }

    // file
    if (args[0].match(/\.json$/)) {
      super(args.shift())
    } else {
      super()
    }

    var command = 'list'

    if (args.length) {
      if (args[0].match(/Q[0-9]+$/)) {
        command = 'format'
      } else {
        command = args.shift()
      }
    }

    if (!WCite.prototype.hasOwnProperty(command) && command !== 'error') {
      this.error(`unknown command "${command}". Command "help" will show a list.`)
    }

    this[command](args)
  }

  format (args) {
    let ids = args.length ? args : Object.keys(this.references)

    // if no file specified, get via Wikidata
    let data = []
    if (this.file) {
      data = ids.map(id => this.references[id]).filter(d => d)
    } else {
      data = ids
    }
    let csl = new Cite(data)

    // TODO: prepend Wikidata identifiers
    console.log(csl.format('bibliography', {
      format: 'text',
      template: 'apa'
    }))
  }

  list (args) {
    let ids = args.length
      ? args.filter(id => id in this.references)
      : Object.keys(this.references)
    ids.forEach(id => console.log(id))
  }

  update (args) {
    let ids = args.length ? args : Object.keys(this.references)

    ids.forEach(id => {
      let data = cite(id)
      if (data) {
        this.add(data)
      } else {
        console.error(`${id} not found`)
      }
    })

    if (this.modified) {
      this.save()
    }
  }

  usage () {
    console.log('Usage: wcite [file] [command] [qids...]')
  }

  help () {
    this.usage()
    console.log(`
Commands:
  list     list Wikidata identifiers 
  update   update selected records or all
  format   format selected records or all
  help     show this usage help
`)
  }

  error (message = 'command "error" called') {
    console.error('wcite: ' + message)
    process.exit(1)
  }
}

module.exports = args => new WCite(args)
