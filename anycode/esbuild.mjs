/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch')

// --- extension

// --- common options

const clientBuildOptions = {
	bundle: true,
	external: ['vscode'],
	target: 'es2020',
	format: 'cjs',
	sourcemap: 'external',
	define: { navigator: 'undefined' }
};

const serverBuildOptions = {
	bundle: true,
	external: ['fs', 'path'],
	target: 'es2020',
	format: 'iife',
	sourcemap: 'external',
	define: { navigator: 'undefined' }
};

async function fixNavigator(outfile) {
	if (fs.existsSync(outfile)) {
		let content = fs.readFileSync(outfile, 'utf8');
		if (content.includes('"navigator"')) {
			content = content.replace(/"navigator"/g, '"__unsupported_navigator__"');
			fs.writeFileSync(outfile, content);
			console.log(`patched ${path.basename(outfile)} to resolve navigator deprecation warning`);
		}
	}
}

const tasks = [
	{
		options: {
			...clientBuildOptions,
			entryPoints: ['client/src/browser/main.ts'],
			outfile: 'dist/anycode.extension.browser.js',
		},
		name: 'browserClient'
	},
	{
		options: {
			...clientBuildOptions,
			platform: 'node',
			entryPoints: ['client/src/node/main.ts'],
			outfile: 'dist/anycode.extension.node.js',
		},
		name: 'nodeClient'
	},
	{
		options: {
			...serverBuildOptions,
			entryPoints: ['server/src/browser/main.ts'],
			outfile: 'dist/anycode.server.browser.js',
		},
		name: 'browserServer'
	},
	{
		options: {
			...serverBuildOptions,
			platform: 'node',
			entryPoints: ['server/src/node/main.ts'],
			outfile: 'dist/anycode.server.node.js',
		},
		name: 'nodeServer'
	},
	{
		options: {
			entryPoints: ['server/src/common/test/trie.test.ts'],
			outfile: 'server/src/common/test/trie.test.js',
			bundle: true,
			external: ['fs', 'path'],
			target: 'es2020',
			format: 'iife',
		},
		name: 'serverTests'
	},
	{
		options: {
			entryPoints: ['server/src/common/test-fixture/client/test.all.ts'],
			outfile: 'server/src/common/test-fixture/client/test.all.js',
			bundle: true,
			define: { process: '{"env":{}}' },
			external: ['fs', 'path'],
			target: 'es2020',
		},
		name: 'testFixture'
	}
];

if (isWatch) {
	for (const task of tasks) {
		const ctx = await esbuild.context(task.options).catch(err => {
			console.error(`Context error for ${task.name}:`, err);
			process.exit(1);
		});
		await ctx.watch({ delay: 500 });
		if (task.options.platform === 'node') {
			await fixNavigator(task.options.outfile);
		}
	}
	console.log('watching...');
} else {
	for (const task of tasks) {
		await esbuild.build(task.options).catch(err => {
			console.error(`Build error for ${task.name}:`, err);
			process.exit(1);
		});
		if (task.options.platform === 'node') {
			await fixNavigator(task.options.outfile);
		}
	}
	console.log('done building');
}
