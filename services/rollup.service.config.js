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
} = require('../scripts/helper/utils');

const dirName = process.env.PACKAGE_NAME;

const extensions = [ '.ts', '.d.ts', '.js' ];

const input = resolveRootPath(`services/packages/${dirName}/${dirName}-service.ts`);
const output = `services/packages/dist/`;

export default {
    input,
    output: {
        file: resolveRootPath(`${output}${dirName}.prod.min.js`),
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
            configFile: path.join(__dirname, '../scripts/build/babel.config.js'),
        }),
        replace({
            'process.env.NODE_ENV': '"production"',
        }),
    ],
};


