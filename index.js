'use strict';

const extract = require('./extract');
const syntax = require('./lib/postcss-syntax/syntax')(extract, 'jsx');

module.exports = syntax;
