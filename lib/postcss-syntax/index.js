'use strict';

const parse = require('./parse');
const stringify = require('./stringify');

const defaultConfig = {
	postcss: 'css',
	stylus: 'css',
	babel: 'jsx',
	xml: 'html',
};

// eslint-disable-next-line no-shadow
function initSyntax(syntax) {
	syntax.stringify = stringify.bind(syntax);
	syntax.parse = parse.bind(syntax);

	return syntax;
}

function syntax(config) {
	return initSyntax({
		config: { ...defaultConfig, ...config },
	});
}

initSyntax(syntax);
syntax.config = defaultConfig;
module.exports = syntax;
