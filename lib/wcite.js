/**
 * Implements the wcite script.
 */
const cite = require('./util/cite')
const Bibliography = require('./bibliography')
const { isQid } = require('./util/wikidata')
const parseArgs = require('minimist')

let Cite

class WCite extends Bibliography {
  constructor (args) {
    // options
    const opts = parseArgs(args, { alias:
      { l: 'language', f: 'format', t: 'template' }
    })
    args = opts._

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

    // options
    this.lang = opts.language || 'en'
    this.format = opts.format || 'text'
    this.template = opts.template || 'apa'

    var command = 'list'

    if (args.length) {
      if (isQid(args[0])) {
        command = 'show'
      } else {
        command = args.shift()
      }
    }

    if (!WCite.prototype.hasOwnProperty(command) && command !== 'error') {
      this.error(`unknown command "${command}". Command "help" will show a list.`)
    }

    this[command](args)
  }

  show (args) {
    const { format, lang, template } = this

    let ids = args.length ? args : Object.keys(this.references)

    // if no file specified, get via Wikidata
    let data = []
    if (this.file) {
      data = ids.map(id => this.references[id]).filter(d => d)
    } else {
      data = ids
    }

    Cite = Cite || require('citation-js')
    let csl = new Cite(data, { output: { lang, link: true }, lang, link: true })

    if (format === 'json') {
      data = csl.get()
      console.log(JSON.stringify(data, null, 2))
    } else {
      let options = { format, lang, template }
      if (format === 'text') {
        options['prepend'] = item => `${item.id}: `
      }
      console.log(csl.format('bibliography', options))
    }
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
      let data = cite(id, { output: { lang: this.language } })
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
    console.log('Usage: wcite [options] [file] [command] [qids...]')
  }

  help () {
    this.usage()
    console.log(`
Options:
  -f, --format <name>    Output format (text|html|json)
  -t, --template <name>  Citation template (apa|vancouver|harvard1)
  -l, --lanuage          Language code

Commands:
  list           list Wikidata identifiers 
  update         update selected records or all
  show           show selected records or all
  help           display this usage help
`)
  }

  error (message = 'command "error" called') {
    console.error('wcite: ' + message)
    process.exit(1)
  }
}

module.exports = {
  run: args => new WCite(args)
}
