import svelte from 'rollup-plugin-svelte-hot';
import resolve from '@rollup/plugin-node-resolve';
import terser  from "@rollup/plugin-terser";
import { readFileSync } from 'fs';

// import pkg from './package.json';
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));


const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: 'src/index.js',
	output: [
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name }
	],
	plugins: [
		svelte(),
		resolve(),
		terser()
	]
};
