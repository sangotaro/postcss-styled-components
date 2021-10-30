'use strict';

const syntax = require('../lib');

describe('react', () => {
	it('first line indentation handle', () => {
		const code = `
export default <img style=
	{
		{
			transform: 'translate(1, 1)',
		}
	}
/>;
`;

		const document = syntax.parse(code, {
			from: 'before.js',
		});

		expect(document.toString(syntax)).toBe(code);
		expect(document.nodes).toHaveLength(1);
		expect(document.first.source.input.css).toMatch(/^\s+\{/);
		expect(document.first.source.start.column).toBe(1);
		expect(document.first.raws.beforeStart).toMatch(/\n$/);
		expect(document.first.first.raws.before).toMatch(/^\s+$/);
		expect(document.first.first.source.start.column).toBeGreaterThan(1);
	});
});
