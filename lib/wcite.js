/**
 * Implements the wcite script.
 */
const cite = require('./util/cite')
const Bibliography = require('./bibliography')
const { isQid } = require('./util/wikidata')
const parseArgs = require('minimist')
const yamlHeaderFile = require('./util/yaml-header-file')
require('./util/object-entries')

const isCommand = cmd => WCite.prototype.hasOwnProperty(cmd) && cmd !== 'error'
const isFile = path => path && path.match(/\.[a-z]/)

const path = require('path')

class WCite extends Bibliography {
  constructor (args) {
    const opts = parseArgs(args, { alias:
      { l: 'language', f: 'format', t: 'template' }
    })
    args = opts._

    // set default command
    if (args.length) {
      if (isQid(args[0])) {
        args.unshift('show')
      } else if (isFile(args[0])) {
        if (isCommand(args[1]) || args[1] === 'add') {
          // swap command and file argument
          [ args[0], args[1] ] = [ args[1], args[0] ]
        } else {
          args.unshift((opts.format || opts.template) ? 'show' : 'list')
        }
      }
    } else {
      args = ['help']
    }

    let command = args.shift()
    let bibliography
    let citekeys

    if (isFile(args[0])) {
      if (args[0].match(/\.json$/)) {
        bibliography = args.shift()
      } else {
        let file = yamlHeaderFile(args.shift())
        let meta = file.header || {}
        if (meta.bibliography) {
          bibliography = path.resolve(path.dirname(file.path), meta.bibliography)
          citekeys = meta.citekeys
          // TODO: make use of nocite
        } else {
          console.warn('Missing YAML field bibliography')
        }
      }
    }

    if (bibliography) {
      super(bibliography)
    } else {
      super()
    }

    this.labels = {}
    if (citekeys) {
      this.citekeys = citekeys
      Object.entries(citekeys).forEach(e => {
        this.labels[e[1]] = e[0]
      })
    }

    // options
    this.lang = opts.language || 'en'
    this.format = opts.format || 'text'
    this.template = opts.template || 'apa'

    if (command === 'add') {
      command = '_add' // TODO: cleanup
    }

    if (!isCommand(command)) {
      this.error(`unknown command "${command}". Command "help" will show a list.`)
    }

    this[command](args)
  }

  show (args) {
    let { format, lang, template } = this
    let ids = args.length ? args : Object.keys(this.references)

    // if no file specified, get via Wikidata
    let data = []
    if (this.file) {
      data = ids.map(id => this.references[id]).filter(d => d)
    } else {
      data = cite.get(ids, { output: { lang: this.language } })
    }

    data.forEach(item => {
      item['citation-label'] = this.labels[item.id] || item.id
    })

    console.log(cite.format(data, { format, lang, template }))
  }

  list (args) {
    let ids = args.length
      ? args.filter(id => id in this.references)
      : Object.keys(this.references)

    const labels = this.labels
    ids.forEach(id => {
      console.log(labels[id] ? labels[id] + ': ' + id : id)
    })
  }

  _add (args) {
    if (args.length) {
      this.update(args)
    }
  }

  update (args) {
    let ids = args.length ? args : Object.keys(this.references)

    let data = cite.get(ids, { output: { lang: this.language } })
    data.forEach(record => this.add(record))

    // TODO: add citekeys via citation-js's getBibTeXLabel

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
Manage bibliographic data from Wikidata. Bibliography CSL JSON file
can be specified explicitly or via YAML header field 'bibliography'.

Options:
  -f, --format <name>    Output format (text|html|bibtex|json|ndjson)
  -t, --template <name>  Citation template (apa|vancouver|harvard1)
  -l, --lanuage          Language code

Commands:
  list           list Wikidata identifiers   
  update         update selected records or all
  add            add records
  show           show selected records or all
  help           display this usage help

Examples:
  $ wcite refs.json         # list Wikidata ids reyfs.json
  $ wcite update refs.json  # update all entries in refs.json
  $ wcite Q18507561         # get bibliographic data from Wikidata
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
