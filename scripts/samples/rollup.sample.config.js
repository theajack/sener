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
import path from 'path';

const {
    resolveRootPath,
} = require('../helper/utils');

const dirName = process.env.PACKAGE_NAME;

const extensions = [ '.ts', '.d.ts', '.js' ];

export default {
    input: resolveRootPath(`scripts/samples/packages/${dirName}/index.ts`),
    output: {
        file: resolveRootPath(`scripts/samples/packages/${dirName}/dist/${dirName}.prod.min.js`),
        format: 'cjs',
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
            configFile: path.join(__dirname, '../build/babel.config.js'),
        }),
        replace({
            'process.env.NODE_ENV': '"production"',
        }),
    ],
};


