/**
 * Wikidata-related utility functions.
 */

module.exports = {
  isQid: id => id.match(/^Q[0-9]+$/)
}
