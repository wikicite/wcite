# pandoc-wikicite

> Pandoc filter to use Wikidata as reference manager

[![Build Status](https://travis-ci.com/wikicite/pandoc-wikicite.svg?branch=master)](https://travis-ci.com/wikicite/pandoc-wikicite)
[![NPM Version](http://img.shields.io/npm/v/pandoc-wikicite.svg?style=flat)](https://www.npmjs.org/package/pandoc-wikicite)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This [Pandoc filter] supports using [Pandoc citation syntax] to reference
bibliographic records from [Wikidata]. Bibliographic data is extracted from
Wikidata with [citation.js] and it can be stored locally in a CSL JSON file.

[Pandoc filter]: https://pandoc.org/filters.html
[Pandoc citation syntax]: https://pandoc.org/MANUAL.html#citations
[Wikidata]: https://www.wikidata.org/
[citation.js]: https://citation.js.org/
[document metadata]: https://pandoc.org/MANUAL.html#extension-yaml_metadata_block

## Table of Contents

* [Background](#background)
* [Install](#install)
* [Usage](#usage)
    * [pwcite](#pwcite)
    * [Bibliography files](#bibliography-files)
    * [wcite](#wcite)
    * [Linking to Wikidata](#linking-to-wikidata)
* [License](#license)

## Background

The knowledge base Wikidata contains statements about all kinds of entities
such as people, places, and publications. The [WikiCite] initiative promotes
using Wikidata as collaboratively curated bibliography. To cite a document it
only needs methods to reference a corresponding Wikidata item and to extract
its bibliographic data.

[WikiCite]: http://wikicite.org/

## Install

Install latest release

    $ npm install -g pandoc-wikicite

Install from source

    $ git clone https://github.com/wikicite/pandoc-wikicite.git
    $ cd pandoc-wikicite
    $ npm install -g .  # or `npm link`

Tested with [NodeJs](https://nodejs.org) version 6 and above.

## Usage

pandoc-wikicite consists of two scripts that can be used independently:

* [pwcite] to use Wikidata identifiers in Pandoc citation keys
* [wcite] to manage locally stored bibliographic data from Wikidata

[pwcite]: #pwcite
[wcite]: #wcite

### pwcite

Write your documents in Markdown with [Pandoc citation syntax]. In short,
reference publications via citation keys prepended by `@`:

    Blah blah [@doe95; @doe99], disputed by @alice07.

Publications listed in Wikidata can be referenced by their item identifier:

    Wikidata is a collaborative knowledge base [@Q18507561].

As these identifiers are ugly to read you can map them from more readable
citekeys in the `citekeys` field of your [document metadata]:

    ---
    citekeys:
      Vrand04: Q18507561
    ...

    Wikidata is a collaborative knowledge base [@Vrand04].

To process this file, call pandoc with two filters (`-F`):

    $ pandoc -F pwcite -F pandoc-citeproc examples/example-1.md

The first filter `pwcite` detects and maps Wikidata identifiers used as
citation keys, downloads the corresponding bibliographic data from Wikidata,
and adds it to the document. The second filter `pandoc-citeproc` creates
nicely references using the Citation Stylesheet Language (CSL).

### Bibliography files

Bibliographic data is downloaded and converted from Wikipedia on each call of
the filter script `pwcite`. This has limitations for two reasons:

* performance: network access is slow
* reproducability: the data could have been been changed on Wikidata

You should therefore store bibliographic data in a local file. The file can be
specified via document metadata field `bibliography` and it must have file
extension `.json`:

    ---
    bibliography: references.json
    ...

    Wikidata is a collaborative knowledge base [@Q18507561].

The filter script `pwcite` detects a JSON bibliography file, looks up referenced
Wikidata items in this file, and adds missing entries by lookup in Wikidata.

The filter `pwcite` use the bibliography file for caching. Wikidata identifiers
are first looked up in the file. If an identifier is not found, its data is
queried from Wikidata and written to the file, so each existing Wikidata
identifier is only queried once. Use [wcite] or delete the file for updates.

If multiple bibliography files are specified then `pwcite` only uses the first
file with extension `.json`, so bibliographic data from Wikidata and from other
sources, for instance BibTeX files, can be mixed.

It is also possible to pass the filename with pandoc option `--bibliography`.
This overrides bibliography files in the document metadata and automatically
enables filter `pandoc-citeproc`, but the file must exist in advance (an empty
file is ok): 

    $ touch references.json
    $ pandoc -F pwcite --bibliography references.json examples/example-1.md

### wcite

The `wcite` script can be used to list or add/update bibliographic data from
Wikidata in a JSON file:

    wcite wikicite.json                    # list Wikidata citekeys
    wcite wikicite.json update Q18507561   # update/add selected
    wcite wikicite.json update             # update all
    wcite Q18507561                        # get and format from Wikidata

The file is always sorted by citekey and serialized as pretty-printed, sorted
JSON so facilitate comparing versions.
 
### Linking to Wikidata

The bibliography generated in HTML format includes Wikidata identifiers for
each reference. Setting document metadata field `wikidata-links` to `true` or
to an URL prefix (e.g. `https://tools.wmflabs.org/scholia/work/`) will inject
two snippets of JavaScript and CSS to add links from references back to Wikidata.

## License

MIT license

Contains parts of [pandoc-filter-node](https://github.com/mvhenderson/pandoc-filter-node).
