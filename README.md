# pandoc-wikicite

> Pandoc filter to use Wikidata as reference manager

This Pandoc filter extends use of [Pandoc’s citation syntax](https://pandoc.org/MANUAL.html#citations) and bibliography by adding Wikidata as source of references.

## Installation

Install from source

    $ git clone https://github.com/wikicite/pandoc-wikicite.git
    $ cd pandoc-wikicite
    $ npm install -g .

## Usage

First create a `.json` file to store references from Wikidata, e.g. `wikicite-bibliography.json`. This file will be read and updated by the Pandoc filter but it must exist to property execute Pandoc in the first place, so initialize an empty JSON array: 
 
    echo '[]' > wikicite-bibliography.json
    pandoc-wikicite wikicite-bibliography.json update       # equivalent

Then reference this file with Pandoc command line option `--bibliography` or metadata value `bibliography`. Pandoc allows multiple bibliography files so you could have one file for references from Wikidata and one for additional references. 

The filter script `pandoc-wikicite` detects a JSON bibliograpyhy file, looks up referenced Wikidata items in this file, and adds missing entries by lookup in Wikidata. Wikidata items can be referenced in two ways:

- citation keys with Wikidata item identifiers (e.g. `@Q52`)
- citation keys mapped to Wikidata item identifiers with metadata map `citekeys`

Example:

    pandoc --filter pandoc-wikicite --bibliography wikicite-bibliography.json test/input.md

The filter script can also be used to list or add/update references:

    pandoc-wikicite wikicite-bibliography.json              # list Wikidata citekeys
    pandoc-wikicite wikicite-bibliography.json update Q52   # update/add selected
    pandoc-wikicite wikicite-bibliography.json update       # update all
 
You should create an alias to briefly call the script with hardcoded bibliography file:

    alias wdcite='pandoc-wikicite wikicite-bibliography.json'
    wdcite              # list Wikidata citekeys
    wdcite update Q52   # update/add selected
    wdcite update       # update all
 
## See also

* [citation.js](https://citation.js.org/)
* [pandoc-filter-node](https://github.com/mvhenderson/pandoc-filter-node)
