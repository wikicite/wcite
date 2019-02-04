/**
 * Commander instance with common settings.
 */
const cli = require('commander')

// Support examples in help output
cli.example = example => {
  (cli._examples = cli._examples || []).push(example)
  return cli
}

cli.on('--help', () => {
  if (cli._examples) {
    console.log('')
    console.log('Examples:')
    cli._examples.forEach(example => {
      console.log(`  $ ${cli._name} ${example}`)
    })
  }
})

module.exports = cli
