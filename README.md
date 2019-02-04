# wcite

> Use Wikidata as reference manager

[![NPM Version](http://img.shields.io/npm/v/wcite.svg?style=flat)](https://www.npmjs.org/package/wcite)
[![Build Status](https://travis-ci.org/wikicite/wcite.svg?branch=master)](https://travis-ci.org/wikicite/wcite)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/github/license/wikicite/wcite.svg)](https://github.com/wikicite/wcite/blob/master/LICENSE.md)
[![Maintainability](https://api.codeclimate.com/v1/badges/b3bd79d9e25a521d0f57/maintainability)](https://codeclimate.com/github/wikicite/wcite/maintainability)

This package provides a command line client to fetch and manage bibliographic
records from [Wikidata] and a [Pandoc filter] to use Wikidata item identifiers
and aliases as citation keys.

## Table of Contents

* [Overview](#overview)
* [Installation](#installation)
* [Background](#background)
* [Usage](#usage)
    * [Introduction](#introduction)
    * [wcite](#wcite)
    * [pwcite](#pwcite)
    * [Bibliography files](#bibliography-files)
* [License](#license)

## Overview

[Wikidata] contains statements about all kinds of entities such as people,
places, and publications. The [WikiCite] initiative promotes using Wikidata as
collaboratively curated bibliography. This package provides:

* the command line client **[wcite]** to fetch bibliographic records from
  Wikidata and to manage them locally in [bibliography files] for writing
  system such as Pandoc and LaTeX.

* the Pandoc filter **[pwcite]** to use Wikidata item identifiers as citation keys
  in [Pandoc citation syntax] and to automatically fetch records from Wikidata.

See [usage](#usage) for details and examples.

## Installation

Install latest release:

    $ npm install -g wcite

Install from source:

    $ git clone https://github.com/wikicite/wcite.git
    $ cd wcite
    $ npm install -g .  # or `npm link`

Tested with [NodeJs](https://nodejs.org) version 6 and above.

## Usage

### Introduction

Bibliographic entities in Wikidata are referenced by their item identifier. For
instance [Q55239420] identifies the first edition of Mary Shelley's
Frankenstein. This can be verified by calling [wcite] with the identifier:

    $ wcite Q55239420
    Q55239420: Shelley, M. (1818). Frankenstein (1st ed.). London

Download the record to [bibliography file] `refs.json`:

    $ wcite refs.json add Q55239420

Records in this file can then be listed and converted:

    $ wcite refs.json
    Q55239420

    $ wcite refs.json -f bibtex
	@book{Q55239420,
	  author={Shelley, Mary},
	  title={Frankenstein},
      ...

When writing a document in Pandoc Markdown, it is enough to reference the
bibliography file via document metadata and directly cite the book with its
citation key `@Q55239420`. Pandoc filter [pwcite] will automatically download
the bibliographic data and store it to `refs.json`. 


[Q55239420]: http://www.wikidata.org/entity/Q55239420

### wcite

The script `wcite` can be used to list or add/update bibliographic data from
Wikidata in [bibliography files]:

    wcite wikicite.json                    # list Wikidata identifiers
    wcite update wikicite.json Q18507561   # update/add selected
    wcite update wikicite.json             # update all
    wcite Q18507561                        # get and format from Wikidata

See `wcite --help` for additional information.

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

The bibliography generated in HTML format includes Wikidata identifiers for
each reference. Setting document metadata field `wikidata-links` to `true` or
to an URL prefix (e.g. `https://tools.wmflabs.org/scholia/work/`) will inject
two snippets of JavaScript and CSS to add links from references back to Wikidata.

## Bibliography files

Bibliographic records fetched from Wikidata should be stored locally for several
reasons:

* performance: network access is slow
* reproducibility: the data could have been been changed on Wikidata

Both [wcite] and [pwcite] store records in a normalized CSL JSON file. Records
in this file are sorted by Wikidata item identifier and serialized as
pretty-printed JSON with sorted keys facilitate comparing changes. Bibliography
file can be specified:

* via document metadata field `bibliography`
* as command line argument to [wcite]
* as existing file `wcite.json` in the current directory

Bibliography files must have file extension `.json`.

Example:

    ---
    bibliography: references.json
    ...

    Wikidata is a collaborative knowledge base [@Q18507561].

The filter script [pwcite] detects a JSON bibliography file, looks up referenced
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
 
## License

MIT license

Fetching and converting data from Wikidata and to BibTeX is implemented with [citation.js].

Contains parts of [pandoc-filter-node](https://github.com/mvhenderson/pandoc-filter-node)
originally created by Mike Henderson.

[bibliography file]: #bibliography-files
[Pandoc citation syntax]: https://pandoc.org/MANUAL.html#citations
[Pandoc filter]: https://pandoc.org/filters.html
[WikiCite]: http://wikicite.org/
[Wikidata]: https://www.wikidata.org/
[citation.js]: https://citation.js.org/
[document metadata]: https://pandoc.org/MANUAL.html#extension-yaml_metadata_block
