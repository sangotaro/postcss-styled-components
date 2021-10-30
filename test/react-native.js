'use strict';

const fs = require('fs');
const syntax = require('../lib');

describe('react-native', () => {
	it('StyleSheet', () => {
		const filename = require.resolve('./fixtures/react-native.mjs');
		let code = fs.readFileSync(filename);

		const document = syntax.parse(code, {
			from: filename,
		});

		code = code.toString();

		expect(document.toString(syntax)).toBe(code);
		expect(document.nodes).toHaveLength(1);
		expect(document.first.nodes).toHaveLength(1);
		expect(document.first.first.nodes).toHaveLength(2);
		expect(document.first.first.first).toHaveProperty('type', 'rule');
		expect(document.first.first.first).toHaveProperty('selector', 'box');
		expect(document.first.first.last).toHaveProperty('type', 'rule');
		expect(document.first.first.last).toHaveProperty('selector', 'text');

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
