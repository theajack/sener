/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import dts from 'rollup-plugin-dts';
const { resolveRootPath } = require('../../scripts/helper/utils');

const extensions = [ '.ts', '.d.ts', '.js' ];

const distPath = 'services/web-request/server/dist/';
const input = resolveRootPath(`services/request/index.ts`);

const config = [ {
    input,
    output: {
        file: resolveRootPath(`${distPath}web-request.min.js`),
        format: 'umd',
        name: 'SenerRequest'
    },
    plugins: [
        uglify(),
        commonjs(),
        typescript(),
        nodeResolve({
            extensions,
        }),
        babel({
            exclude: [ 'node_modules/**' ],
            extensions,
            configFile: resolveRootPath(`scripts/build/babel.config.js`),
        }),
        replace({
            'process.env.NODE_ENV': '"production"',
        }),
    ],
} ];

if (process.env.DEV !== 'true') {
    config.push({
        input,
        output: {
            file: resolveRootPath(`${distPath}web-request.min.d.ts`),
            format: 'es',
        },
        plugins: [ dts() ],
    });
}

console.log('config.length', config.length);

export default config;


