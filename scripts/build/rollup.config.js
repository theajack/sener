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
import replace from 'rollup-plugin-replace';
import path from 'path';

const { plugins, name, buildFormats, onBuildConfig } = require('../build.config');

const {
    extractSinglePackageInfo,
    resolvePackagePath,
    upcaseFirstLetter,
    resolveRootPath,
} = require('../helper/utils');
const pkg = require(resolveRootPath('packages/sener/package.json'));

const { buildPackageName } = require('./package-utils');

const dirName = process.env.PACKAGE_NAME;
const packageInfo = extractSinglePackageInfo(dirName);
console.log(packageInfo.dependencies);

const extensions = [ '.ts', '.d.ts', '.js' ];

const isMainPackage = dirName === name;

const inputFile = resolvePackagePath(`${dirName}/src/index.ts`);
console.log(inputFile);

const packageName = buildPackageName(dirName);

function createDts (input, bundleName) {
    if (!bundleName) {
        bundleName = `${packageName}.d.ts`;
    }
    return {
        // 生成 .d.ts 类型声明文件
        input,
        output: {
            file: resolvePackagePath(`${dirName}/dist/${bundleName}`),
            format: 'es',
        },
        plugins: [ dts() ],
    };
}

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
            replace({
                'process.env.NODE_ENV': '"production"',
                'process.env.VERSION': `"${pkg.version}"`,
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
    createDts(inputFile)
];

if (onBuildConfig) {
    onBuildConfig(config, dirName, createBaseConfig, createDts);
}

export default config;


