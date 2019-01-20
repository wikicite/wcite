(refs => {
  const base = 'http://www.wikidata.org/entity/'
  Array.from(refs).filter(e => (e.id || '').match(/^ref-(Q[0-9]+)$/))
    .forEach(div => {
      var qid = div.id.substr(4)
      var a = document.createElement('a')
      a.className = 'wikidata-link'
      a.href = base + qid
      var p = div.firstElementChild
      p.insertBefore(a, p.firstChild)
    })
})(document.getElementById('refs').childNodes || [])
