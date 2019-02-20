class Writer {
  constructor (opts) {
    this.out = opts.out || process.stdout
    this.err = opts.err || process.stderr
    this.quiet = opts.quiet
  }

  say (msg) {
    this.out.write(msg + '\n')
  }

  log (msg) {
    if (!this.quiet) {
      this.say(msg)
    }
  }

  warn (msg) {
    if (!this.quiet) {
      this.err.write(msg + '\n')
    }
  }
}

module.exports = Writer
