'use strict';

const fs = require('fs');
const spawnSync = require('child_process').spawnSync;
const files = spawnSync('git', ['ls-files', 'lib', 'test'], { encoding: 'utf8' }).stdout.match(
	/^.+\.js$/gm,
);
const syntax = require('../lib');

describe('not throw error for non-style js file', () => {
	files.forEach((file) => {
		it(`${file}`, () => {
			const code = fs.readFileSync(file);
			const document = syntax.parse(code, {
				from: file,
			});

			expect(document.source).toHaveProperty('lang', 'jsx');
			expect(document.toString()).toBe(code.toString());
		});
	});
});
