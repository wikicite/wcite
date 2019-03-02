module.exports = file => {
  const ext = file ? file.split('.').pop() : ''
  if (ext.match(/(html|json|ndjson)/)) {
    return ext
  } else if (ext === 'bib') {
    return 'bibtex'
  }
}
