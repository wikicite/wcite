# pandoc-wikicite

> Pandoc filter to use Wikidata as reference manager

[![Build Status](https://travis-ci.com/wikicite/pandoc-wikicite.svg?branch=master)](https://travis-ci.com/wikicite/pandoc-wikicite)
[![NPM Version](http://img.shields.io/npm/v/pandoc-wikicite.svg?style=flat)](https://www.npmjs.org/package/pandoc-wikicite)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This [Pandoc filter] supports using Pandoc’s [citation syntax] to reference bibliographic records from [Wikidata]. Bibliographic data is extracted from Wikidata with [citation.js] and stored locally in a CSL JSON file.

[Pandoc filter]: https://pandoc.org/filters.html
[citation syntax]: https://pandoc.org/MANUAL.html#citations 
[Wikidata]: https://www.wikidata.org/
[citation.js]: https://citation.js.org/

## Table of Contents

* [Background](#background)
* [Install](#install)
* [Usage](#usage)
* [License](#license)

## Background

The knowledge base Wikidata contains statements about all kinds of entities such as people, places, and publications. The [WikiCite] initiative promotes using Wikidata as collaboratively curated bibliography. To cite a document it only needs methods to reference a corresponding Wikidata item and to extract its bibliographic data.

[WikiCite]: http://wikicite.org/

## Install

Install latest release

    $ npm install -g pandoc-wikicite

Install from source

    $ git clone https://github.com/wikicite/pandoc-wikicite.git
    $ cd pandoc-wikicite
    $ npm install -g .

Tested with [NodeJs](https://nodejs.org) version 6 and above.

## Usage

*This is an early release, usage may slightly change to best facilitate most common workflows!*

The following Pandoc Markdown document (`test/example.md`) illustrates the use of pandoc-wikicite:

    ---
    bibliography: wikicite.json
    citekeys:
      wikidata: Q2013
    ...

    Wikipedia [@Q52] is older than Wikidata [@wikidata].

It references two bibliographic items: one directly by its Wikidata identifier `Q52` and the other by citation key `wikidata` mapped to the Wikidata identifier `Q2013`. To process this file, call pandoc via:

    $ pandoc --filter pandoc-wikicite --filter pandoc-citeproc test/example.md

You can also reference the bibliography file via command line like this:

    $ pandoc --filter pandoc-wikicite --bibliography wikicite.json test/example.md

In this case the metadata field `bibliography` in the source file is ignored but the bibliography file must exist to properly execute pandoc.

Pandoc allows multiple bibliography files so you could have one file for references from Wikidata and one for additional references. 

The filter script `pandoc-wikicite` detects a JSON bibliograpyhy file, looks up referenced Wikidata items in this file, and adds missing entries by lookup in Wikidata. Wikidata items can be referenced in two ways:

- citation keys with Wikidata item identifiers (e.g. `@Q52`)
- citation keys mapped to Wikidata item identifiers with metadata map `citekeys`

More examples:

    pandoc --filter pandoc-wikicite --bibliography wikicite.json test/input.md

The filter script can also be used to list or add/update references (*this is experimental*):

    pandoc-wikicite wikicite.json              # list Wikidata citekeys
    pandoc-wikicite wikicite.json update Q52   # update/add selected
    pandoc-wikicite wikicite.json update       # update all
 
You should create an alias to briefly call the script with hardcoded bibliography file:

    alias wdcite='pandoc-wikicite wikicite.json'
    wdcite              # list Wikidata citekeys
    wdcite update Q52   # update/add selected
    wdcite update       # update all

## License

MIT license

Contains parts of [pandoc-filter-node](https://github.com/mvhenderson/pandoc-filter-node).
