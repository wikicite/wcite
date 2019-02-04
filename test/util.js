/**
 * Utility functions and boilerplate for tests.
 */
const should = require('should')
const path = require('path')
const fs = require('fs')
const os = require('os')

const pkgfile = (...args) => path.join(__dirname, '/../', ...args)
const random = () => Math.random().toString(36).substring(2)
const tempfile = () => path.join(os.tmpdir(), '/', random() + '.json')

module.exports = { should, pkgfile, tempfile, fs, path }
