class Writer {
  constructor (opts) {
    this.out = opts.out || process.stdout
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
      process.stderr.write(msg + '\n')
    }
  }
}

module.exports = Writer
