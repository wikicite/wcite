---
title: pandoc-wikicite for reference managing with Wikidata
author: Jakob Voß

wikidata-links: true
citekeys:
  Scholia: Q58484849
  Pandoc: Q2049294 
nocite: | 
  @Q27044176

abstract: |
  This document illustrates use of Wikidata as reference manager with
  [pandoc-wikicite](https://www.npmjs.com/package/pandoc-wikicite)
...

## Wikidata and WikiCite

Wikidata is a community-curated knowledge based that covers and connects all
kinds of entities such as people, places, and publications [@Q18507561].  The
WikiCite initiative^[See <http://wikicite.org/> for additional links.]
promotes using Wikidata as universal bibliographic database.

The benefits of having bibliographic data in a knowledge base are best
illustrated by the [Scholia] frontend to Wikidata: this website can be used to
explore research publications and their connections to authors, institutions,
places and other enties [@Scholia].

## Pandoc and pandoc-wikicite

[Pandoc] is a document converter that can be used to write scholarly documents
including citations in Markdown syntax [@Pandoc]. See the [Pandoc manual on
citations](https://pandoc.org/MANUAL.html#citations) for details. Pandoc allows
to process a document via filters during conversion.

[pandoc-wikicite] is a Pandoc filter that looks up citations in Wikidata. The
bibliographic data can be cached locally in CSL JSON format and formatted in 
different citation styles based on [Citation Style Language] @Q824708.

This document is an example of a document converted with pandoc-wikicite
(see [Markdown source code](https://raw.githubusercontent.com/wikicite/pandoc-wikicite/master/home/index.md)).
 
Further information about pandoc-wikicate can be found here:

* <https://www.npmjs.org/package/pandoc-wikicite>
* <https://github.com/wikicite/pandoc-wikicite#readme>


[Citation Style Language]: https://citationstyles.org/
[Pandoc]: http://pandoc.org/
[pandoc-wikicite]: https://github.com/wikicite/pandoc-wikicite
[Scholia]: https://tools.wmflabs.org/scholia/

## References

This bibliography has automatically been created with pandoc-citeproc and
pandoc-wikicite. See [`references.json`](references.json) for the generated
bibliography in CSL JSON format.

