/**
 * Recursively sort object keys for stable JSON serialization.
 * This gives better diffs when comparing changes in JSON file.
 */

function normalize (value) {
  if (!value || typeof value !== 'object') {
    return value
  } else if (Array.isArray(value)) {
    return value.map(normalize)
  } else {
    let sorted = {}
    Object.keys(value).sort().forEach(key => {
      sorted[key] = normalize(value[key])
    })
    return sorted
  }
}

module.exports = normalize
