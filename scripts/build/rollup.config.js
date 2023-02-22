/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import path from 'path';
const { plugins, name, buildFormats } = require('../build.config');

const {
    extractSinglePackageInfo,
    resolvePackagePath,
    upcaseFirstLetter,
} = require('../helper/utils');
const { buildPackageName } = require('./package-utils');

const dirName = process.env.PACKAGE_NAME;
const packageInfo = extractSinglePackageInfo(dirName);
console.log(packageInfo.dependencies);

const extensions = [ '.ts', '.d.ts', '.js' ];

const isMainPackage = dirName === name;

const inputFile = resolvePackagePath(`${dirName}/src/index.ts`);
console.log(inputFile);

const packageName = buildPackageName(dirName);

const createBaseConfig = ({
    format = 'esm',
    bundleName,
    input = inputFile,
}) => {

    if (!bundleName) {
        bundleName = `${packageName}.${format}.js`;
    }

    return {
        input,
        output: {
            file: resolvePackagePath(`${dirName}/dist/${bundleName}`),
            format,
            name: `${upcaseFirstLetter(name)}${isMainPackage ? '' : upcaseFirstLetter(dirName)}`,
            // sourcemap: true,
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
                configFile: path.join(__dirname, './babel.config.js'),
            }),
            ...plugins,
        ],
    };
};

const config = [
    ...buildFormats.map(format => {
        const data = createBaseConfig({ format });
        if (format !== 'iife') {
            data.external = packageInfo.dependencies;
        }
        return data;
    }),
    {
    // 生成 .d.ts 类型声明文件
        input: inputFile,
        output: {
            file: resolvePackagePath(`${dirName}/dist/${packageName}.d.ts`),
            format: 'es',
        },
        plugins: [ dts() ],
    },
];

export default config;


