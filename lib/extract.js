'use strict';

const getTemplate = require('./get-template');
const loadSyntax = require('./postcss-syntax/load-syntax');
const { parse, types, traverse, loadOptions } = require('@babel/core');

const supports = {
	'styled-components': true,
};

const plugins = [
	'jsx',
	'typescript',
	'objectRestSpread',
	['decorators', { decoratorsBeforeExport: false }],
	'classProperties',
	'exportExtensions',
	'asyncGenerators',
	'functionBind',
	'functionSent',
	'dynamicImport',
	'optionalCatchBinding',
];

function loadBabelOpts(opts) {
	const filename = opts.from && opts.from.replace(/\?.*$/, '');

	opts = {
		filename,
		parserOpts: {
			plugins,
			sourceFilename: filename,
			sourceType: filename && /\.m[tj]sx?$/.test(filename) ? 'module' : 'unambiguous',
			allowImportExportEverywhere: true,
			allowAwaitOutsideFunction: true,
			allowReturnOutsideFunction: true,
			allowSuperOutsideMethod: true,
		},
	};
	let fileOpts;

	try {
		fileOpts =
			filename &&
			loadOptions({
				filename,
			});
	} catch (ex) {
		//
	}

	for (const key in fileOpts) {
		if (Array.isArray(fileOpts[key]) && !fileOpts[key].length) {
			continue;
		}

		opts[key] = fileOpts[key];

		if (Array.isArray(fileOpts[key]) && Array.isArray(opts.parserOpts[key])) {
			// combine arrays for plugins
			opts.parserOpts[key] = opts.parserOpts[key].concat(fileOpts[key]);
		} else {
			// because some options need to be passed to parser also
			opts.parserOpts[key] = fileOpts[key];
		}
	}

	return opts;
}

function literalParser(source, opts, styles) {
	let ast;

	try {
		ast = parse(source, loadBabelOpts(opts));
	} catch (ex) {
		return styles || [];
	}

	const specifiers = new Map();
	const variableDeclarator = new Map();
	const tplLiteral = new Set();

	function setSpecifier(id, nameSpace) {
		nameSpace.unshift(
			...nameSpace
				.shift()
				.replace(/^\W+/, '')
				.split(/[/\\]+/g),
		);

		if (types.isIdentifier(id)) {
			specifiers.set(id.name, nameSpace);
			specifiers.set(id, nameSpace);
		} else if (types.isObjectPattern(id)) {
			id.properties.forEach((property) => {
				if (types.isObjectProperty(property)) {
					const key = property.key;

					nameSpace = nameSpace.concat(key.name || key.value);
					id = property.value;
				} else {
					id = property.argument;
				}

				setSpecifier(id, nameSpace);
			});
		} else if (types.isArrayPattern(id)) {
			id.elements.forEach((element, i) => {
				setSpecifier(element, nameSpace.concat(String(i)));
			});
		}
	}

	function getNameSpace(path, nameSpace) {
		let node = path.node;

		if (path.isIdentifier() || path.isJSXIdentifier()) {
			node = path.scope.getBindingIdentifier(node.name) || node;
			const specifier = specifiers.get(node) || specifiers.get(node.name);

			if (specifier) {
				nameSpace.unshift(...specifier);
			} else {
				nameSpace.unshift(node.name);
			}
		} else {
			['name', 'property', 'object', 'callee'].forEach((prop) => {
				node[prop] && getNameSpace(path.get(prop), nameSpace);
			});
		}

		return nameSpace;
	}

	function isStylePath(path) {
		return getNameSpace(path, []).some(function (name, ...args) {
			const result =
				name &&
				((Object.prototype.hasOwnProperty.call(supports, name) && supports[name]) ||
					(Object.prototype.hasOwnProperty.call(opts.syntax.config, name) &&
						opts.syntax.config[name]));

			switch (typeof result) {
				case 'function': {
					return result.apply(this, args);
				}
				case 'boolean': {
					return result;
				}
				default: {
					return undefined;
				}
			}
		});
	}

	const visitor = {
		ImportDeclaration: (path) => {
			const moduleId = path.node.source.value;

			path.node.specifiers.forEach((specifier) => {
				const nameSpace = [moduleId];

				if (specifier.imported) {
					nameSpace.push(specifier.imported.name);
				}

				setSpecifier(specifier.local, nameSpace);
			});
		},
		VariableDeclarator: (path) => {
			variableDeclarator.set(path.node.id, path.node.init ? [path.get('init')] : []);
		},
		AssignmentExpression: (path) => {
			if (types.isIdentifier(path.node.left) && types.isObjectExpression(path.node.right)) {
				const identifier = path.scope.getBindingIdentifier(path.node.left.name);
				const variable = variableDeclarator.get(identifier);
				const valuePath = path.get('right');

				if (variable) {
					variable.push(valuePath);
				} else {
					variableDeclarator.set(identifier, [valuePath]);
				}
			}
		},
		CallExpression: (path) => {
			const callee = path.node.callee;

			if (
				types.isIdentifier(callee, { name: 'require' }) &&
				!path.scope.getBindingIdentifier(callee.name)
			) {
				path.node.arguments.filter(types.isStringLiteral).forEach((arg) => {
					const moduleId = arg.value;
					const nameSpace = [moduleId];
					let currPath = path;

					do {
						let id = currPath.parent.id;

						if (!id) {
							id = currPath.parent.left;

							if (id) {
								id = path.scope.getBindingIdentifier(id.name) || id;
							} else {
								if (types.isIdentifier(currPath.parent.property)) {
									nameSpace.push(currPath.parent.property.name);
								}

								currPath = currPath.parentPath;
								continue;
							}
						}

						setSpecifier(id, nameSpace);
						break;
					} while (currPath);
				});
			}
		},
		TaggedTemplateExpression: (path) => {
			if (isStylePath(path.get('tag'))) {
				tplLiteral.add(path.node.quasi);
			}
		},
	};

	traverse(ast, visitor);

	const tplLiteralStyles = [];

	Array.from(tplLiteral).forEach((node) => {
		const quasis = node.quasis.map((quasiNode) => ({
			start: quasiNode.start,
			end: quasiNode.end,
		}));
		const style = {
			startIndex: quasis[0].start,
			endIndex: quasis[quasis.length - 1].end,
			content: getTemplate(node, source),
		};

		if (node.expressions.length) {
			const expressions = node.expressions.map((expressionNode) => ({
				start: expressionNode.start,
				end: expressionNode.end,
			}));

			style.syntax = loadSyntax(opts, __dirname);
			style.lang = 'template-literal';
			style.opts = {
				quasis,
				expressions,
			};
		} else {
			style.lang = 'css';
		}

		let parent = null;
		let targetStyles = tplLiteralStyles;

		while (targetStyles) {
			const target = targetStyles.find(
				(targetStyle) =>
					targetStyle.opts &&
					targetStyle.opts.expressions.some(
						(expr) => expr.start <= style.startIndex && style.endIndex < expr.end,
					),
			);

			if (target) {
				parent = target;
				targetStyles = target.opts.templateLiteralStyles;
			} else {
				break;
			}
		}

		if (parent) {
			const templateLiteralStyles =
				parent.opts.templateLiteralStyles || (parent.opts.templateLiteralStyles = []);

			templateLiteralStyles.push(style);
		} else {
			tplLiteralStyles.push(style);
		}
	});

	return (styles || []).concat(tplLiteralStyles);
}

module.exports = literalParser;
