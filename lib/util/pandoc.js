/**
 * Yet another port of pandocfilters.
 *
 * Partly based on <https://github.com/mvhenderson/pandoc-filter-node>
 * originally (C) 2014 Mike Henderson
 *
 * MIT License
 */

const stdin = process.stdin

/**
 * Read Pandoc JSON from stdin, applies passed filter function
 * `filter(root, format, meta)` and print new JSON to stdout.
 */
function filter (filter, args) {
  args = args || process.argv.slice(2)
  var json = ''
  stdin.setEncoding('utf8')
  stdin.on('data', data => { json += data })
  stdin.on('end', () => {
    var data = JSON.parse(json)
    var format = args.length ? args[0] : ''
    var output = filter(data, format, data.meta || data[0].unMeta)
    process.stdout.write(JSON.stringify(output))
  })
}

/**
 * Convert metadata into plain objects, arrays, and scalars.
 */
function metavalues (meta, field) {

  // get document metadata
  if ('pandoc-api-version' in meta) {
    meta = meta.meta
  } else if (Array.isArray(meta)) {
    meta = meta[0].unMeta
  }

  const _metadata = x => {
    let { t, c } = x
    if (t === 'MetaMap') {
      return _mapObject(c)
    } else if (t === 'MetaList') {
      return c.map(_metadata)
    } else if (t === 'MetaBool') {
      return c
    } else {
      return stringify(x)
    }
  }

  const _mapObject = (obj, field) => {
    obj = Object.keys(obj).reduce((values, key) => {
      values[key] = _metadata(obj[key])
      return values
    }, {})
    return field ? obj[field] : obj
  }

  return _mapObject(meta, field)
}

/**
 * Convert JSON structure into metadata.
 */
function metadata (data) {
  if (Array.isArray(data)) {
    return { t: 'MetaList', c: data.map(metadata) }
  } else if (typeof data === 'boolean' || data === null || data === undefined) {
    return { t: 'MetaBool', c: !!data }
  } else if (typeof data === 'object') {
    let map = Object.keys(data).reduce((res, key) => {
      res[key] = metadata(data[key])
      return res
    }, {})
    return { t: 'MetaMap', c: map }
  } else {
    return { t: 'MetaString', c: data.toString() }
  }
}

/**
 * Walk a tree, applying an action to every object.
 * @param  {Object}   x      The object to traverse
 * @param  {Function} action Callback to apply to each item
 * @param  {String}   format Output format
 * @param  {Object}   meta   Pandoc metadata
 * @return {Object}          The modified tree
 */
function walk (x, action, format, meta) {
  if (Array.isArray(x)) {
    var array = []
    x.forEach(function (item) {
      if (item === Object(item) && item.t) {
        var res = action(item.t, item.c || [], format, meta)
        if (!res) {
          array.push(walk(item, action, format, meta))
        } else if (Array.isArray(res)) {
          res.forEach(function (z) {
            array.push(walk(z, action, format, meta))
          })
        } else {
          array.push(walk(res, action, format, meta))
        }
      } else {
        array.push(walk(item, action, format, meta))
      }
    })
    return array
  } else if (x === Object(x)) {
    var obj = {}
    Object.keys(x).forEach(function (k) {
      obj[k] = walk(x[k], action, format, meta)
    })
    return obj
  }
  return x
}

/**
 * Walks the tree x and returns concatenated string content, leaving out all
 * formatting.
 * @param  {Object} x The object to walk
 * @return {String}   JSON string
 */
function stringify (x) {
  if (x === Object(x) && x.t === 'MetaString') return x.c

  var result = []
  var go = function (key, val) {
    if (key === 'Str') result.push(val)
    else if (key === 'Code') result.push(val[1])
    else if (key === 'Math') result.push(val[1])
    else if (key === 'LineBreak') result.push(' ')
    else if (key === 'Space') result.push(' ')
  }
  walk(x, go, '', {})
  return result.join('')
}

/**
 * Selected pandoc elements
 */
function RawBlock (format, content) {
  return { t: 'RawBlock', c: [format, content] }
}

function MetaBlocks (content) {
  return { t: 'MetaBlocks', c: content }
}

module.exports = { filter, metadata, metavalues, stringify, walk, RawBlock, MetaBlocks }
