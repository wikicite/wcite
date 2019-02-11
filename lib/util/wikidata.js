/**
 * Wikidata-related utility functions.
 */

module.exports = {
  isQid: id => typeof id === 'string' && id.match(/^Q[0-9]+$/),
  cutQid: id => id.match(/^(https?:.+)Q[0-9]+$/)
    ? id.replace(/^.*(Q[0-9]+)$/, '$1') : id
}
