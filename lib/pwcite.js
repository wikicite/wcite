/**
 * Implements the pwcite script.
 */
const pandoc = require('./pandoc')
const { filter } = require('./index')

module.exports = args => pandoc.filter(filter, args)
