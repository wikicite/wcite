# wcite

> Use Wikidata as reference manager

[![NPM Version](https://img.shields.io/npm/v/wcite.svg?style=flat)](https://www.npmjs.org/package/wcite)
[![Build Status](https://travis-ci.org/wikicite/wcite.svg?branch=master)](https://travis-ci.org/wikicite/wcite)
[![Open Issues](https://img.shields.io/github/issues-raw/wikicite/wcite.svg?style=flat)](https://github.com/wikicite/wcite/issues)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/github/license/wikicite/wcite.svg)](https://github.com/wikicite/wcite/blob/master/LICENSE.md)
[![Maintainability](https://api.codeclimate.com/v1/badges/b3bd79d9e25a521d0f57/maintainability)](https://codeclimate.com/github/wikicite/wcite/maintainability)
[![Coverage Status](https://coveralls.io/repos/github/wikicite/wcite/badge.svg?branch=master)](https://coveralls.io/github/wikicite/wcite?branch=master)

This JavaScript package provides [a command line client](#command-wcite) to
fetch and manage bibliographic records from [Wikidata] and a [Pandoc filter] to
use Wikidata item identifiers and aliases as citation keys.

## Table of Contents

* [Overview](#overview)
* [Installation](#installation)
* [Usage](#usage)
    * [Introduction](#introduction)
    * [Command wcite](#command-wcite)
    * [Filter pwcite](#filter-pwcite)
    * [Linking bibliography entries to Wikidata](#linking-bibliography-entries-to-Wikidata)
    * [Bibliography files](#bibliography-files)
* [API](#api)
* [License](#license)
* [References](#references)

## Overview

[Wikidata] contains statements about all kinds of entities such as people,
places, and publications. The [WikiCite] initiative promotes using Wikidata as
collaboratively curated bibliography. The [JavaScript package
wcite](https://www.npmjs.org/package/wcite) provides:

* the command line client **[wcite]** to fetch bibliographic records from
  Wikidata and to manage them locally in [bibliography files] for writing
  system such as Pandoc and LaTeX.

* the Pandoc filter **[pwcite]** to use Wikidata item identifiers as citation keys
  in [Pandoc citation syntax] to automatically fetch records from Wikidata.

See [usage](#usage) for details and examples.

## Installation

Install latest release:

    $ npm install -g wcite

Install from source:

    $ git clone https://github.com/wikicite/wcite.git
    $ cd wcite
    $ npm install -g .  # or `npm link`

Tested with [NodeJs](https://nodejs.org) version 8 and above.

## Usage

### Introduction

Bibliographic entities in Wikidata are referenced by their item identifier.
For instance [`Q55239420`] identifies the first edition of [Mary Shelley's
novel *Frankenstein*](https://en.wikipedia.org/wiki/Frankenstein). Its
bibliographic data can be shown by calling [wcite] with the identifier:

    $ wcite Q55239420
    Q55239420: Shelley, M. (1818). Frankenstein (1st ed.). London

To locally save the bibliographic data in a [bibliography file] pass its name as
argument or with option `-b`/`--bibliography`:

    $ wcite refs.json add Q55239420
    Q55239420 added

Records from the file can be listed in multiple formats:

    $ wcite refs.json
    Q55239420

    $ wcite refs.json -f bibtex
	@book{Q55239420,
	  author={Shelley, Mary},
	  title={Frankenstein},
      edition=1,
      ...

All this is done automatically with Pandoc filter [pwcite].

[`Q55239420`]: http://www.wikidata.org/entity/Q55239420

### Command wcite

The command line script `wcite` can fetch and transform bibliographic data from
Wikidata and locally manage it in a [bibliography file]. In addition to
bibliography files the script can read and write document files with YAML
header.

~~~
Usage: wcite [options] [command] [file] [ids...]

Manage bibliographic data from Wikidata. Bibliography CSL JSON file
can be specified explicitly or via YAML header field 'bibliography'.

Options:
  -V, --version              output the version number
  -b, --bibliography <file>  Bibliography file (CSL JSON)
  -d, --document <file>      Document file with YAML header
  -f, --format <name>        Output format (text|html|bibtex|bibtxt|json|ndjson)
  -o, --output <file>        Output file. Format can be guessed from extension
  -t, --template <name>      Citation template (apa|vancouver|harvard1)
  -l, --language <lang>      Language codes (separate with space or comma)
  -i, --ids <file>           Read ids from (use `-` for stdin)
  -q, --quiet                Avoid status output
  -h, --help                 output usage information

Commands:
  add <ids...>               add records specified by Wikidata identifiers
  remove <ids...>            remove records by Wikidata identifiers or aliases
  get [ids...]               show bibliographic records
  update [ids...]            update bibliographic records
  list                       list Wikidata identifiers and aliases
  help                       display this usage help

Examples:
  $ wcite refs.json          # list Wikidata ids in refs.json
  $ wcite update refs.json   # update all entries in refs.json
  $ wcite Q18507561          # get bibliographic data from Wikidata
~~~

### Filter pwcite

The [Pandoc filter] `pwcite` processes a document to detect citation keys that
use Wikidata item identifiers. Simply write your documents in Markdown and use
[Pandoc citation syntax] to reference publications such as the following:

    Blah blah [@doe95; @doe99], disputed by @alice07.

Publications from Wikidata can be referenced using their identifiers like this:

    Wikidata is a collaborative knowledge base [@Q18507561].

As these identifiers are hard to read and write you better define aliases with
the `citekeys` field of your [document metadata]:

    ---
    citekeys:
      Vrand04: Q18507561
    ...

    Wikidata is a collaborative knowledge base [@Vrand04].

To process this file, call pandoc with filter `pwcite` followed by filter
`pandoc-citeproc`:

    $ pandoc -F pwcite -F pandoc-citeproc example.md

The first filter detects referenced Wikidata items, downloads the corresponding
bibliographic records from Wikidata, and adds them to the document. The second
filter creates nicely formatted references using the [Citation Style Language
(CSL)](https://citationstyles.org/).

A local [bibliography file] can be specified in metadata field `bibliography`
for caching:

    ---
    citekeys:
      Vrand04: Q18507561
    bibliography: refs.json 
    ...

    Wikidata is a collaborative knowledge base [@Vrand04].

If multiple bibliography files are specified then all are used for referencing but
only the first file with extension `.json` is to store records fetched from Wikidata.
This way it is possible to get some references from Wikidata and use other sources as
well for instance BibTeX files.

Pandoc option `--bibliography` overrides an existing metadata field and
automatically enables filter `pandoc-citeproc`. The file must exist in advance:

    $ echo [] > refs.json
    $ pandoc -F pwcite --bibliography refs.json example.md

## Linking bibliography entries to Wikidata

Each bibliography entry in HTML format includes the Wikidata item identifier in
its `id` attribute (e.g. `<div id="ref-Q55239420">...`). This identifier can be
used to add a link to the corresponding Wikidata item or to other services such
as [Scholia](https://tools.wmflabs.org/scholia/). The filter [pwcite] can
inject snippets of JavaScript and CSS to add links from bibliography entries to
Wikidata. To to do set document metadata field `link-wikidata-references` to
`true` or to an URL prefix (e.g. `https://tools.wmflabs.org/scholia/work/`).
This feature is based on Pandoc metadata variable `include-after`, so don't set
it via Pandoc command line option `-A/--include-after-body` and don'r remove the
variable in custom HTML templates!

## Bibliography files

Bibliographic records fetched from Wikidata should be stored locally for several
reasons:

* performance: network access is slow
* reproducibility: the data could have been been changed on Wikidata

Both [wcite] and [pwcite] store records in a normalized CSL JSON file. Records
in this file are sorted by Wikidata item identifier and serialized as
pretty-printed JSON with sorted keys to facilitate comparing changes.

Bibliography files must have file extension `.json`. A file can be specified:

* via document metadata field `bibliography` (see example at [pwcite])
* as command line argument to [wcite]
* as existing file `wcite.json` (*not implemented yet*)

Both [wcite] and [pwcite] use bibliography files for caching: records are first
looked up by their Wikidata item identifier in the file and queried from
Wikidata only if not found locally. Use [wcite] to delete or update records if
needed.
 
## API

The JavaScript API to use this package as module is not finished yet. Stable
parts include:

### Bibliography

This class implements a [bibliography file] that stores CSL JSON records from
Wikidata.

~~~js
const { Bibliography } = require('wcite')

var refs = new Bibliography('refs.json')

refs.add(item)
let record = refs.get(id, citekeys) 

if (refs.modified) {
  refs.save()
}
~~~

### wcite

Provides the implementation of command [wcite-cli]

~~~js
const { wcite } = require('wcite')

wcite({ bibliography: 'refs.json' }).list()
~~~

## License

MIT license

Contains parts of [pandoc-filter-node](https://github.com/mvhenderson/pandoc-filter-node)
originally created by Mike Henderson.

## Acknowledgements

Fetching and converting data from Wikidata and to BibTeX is implemented with
[citation.js] created by Lars Willighagen.

## References

A bibliography of some publications relevant to wcite is included in the source
code repository following here for the purpose of demonstration at
<http://wikicite.org/wcite/#references>.


[wcite]: #command-wcite
[pwcite]: #filter-pwcite
[bibliography file]: #bibliography-files
[bibliography files]: #bibliography-file
[Pandoc citation syntax]: https://pandoc.org/MANUAL.html#citations
[Pandoc filter]: https://pandoc.org/filters.html
[WikiCite]: http://wikicite.org/
[Wikidata]: https://www.wikidata.org/
[citation.js]: https://citation.js.org/
[document metadata]: https://pandoc.org/MANUAL.html#extension-yaml_metadata_block
