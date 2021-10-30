'use strict';

const fs = require('fs');
const syntax = require('../lib');

describe('javascript tests', () => {
	it('glamorous', () => {
		const filename = require.resolve('./fixtures/glamorous.jsx');
		let code = fs.readFileSync(filename);

		const document = syntax.parse(code, {
			from: filename,
		});

		code = code.toString();

		expect(document.toString(syntax)).toBe(code);
		expect(document.nodes).toHaveLength(5);

		document.nodes.forEach((root) => {
			expect(root.source).toHaveProperty('input');

			expect(code).toEqual(expect.stringContaining(root.source.input.css));
			expect(root.source.input.css.length).toBeLessThan(code.length);
			expect(root.source.start.line).toBeGreaterThan(1);

			root.walk((node) => {
				expect(node).toHaveProperty('source');

				expect(node.source.input.css).toBe(root.source.input.css);

				expect(node.source).toHaveProperty('start.line');
				expect(node.source).toHaveProperty('end.line');
			});
		});
	});
});
