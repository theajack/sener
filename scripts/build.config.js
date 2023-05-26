/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 11:29:23
 * @Description: Coding something
 */
// const vuePlugin = require('rollup-plugin-vue');
// const yaml = require('@rollup/plugin-yaml');
// const json = require('@rollup/plugin-json');

const { copyFile, resolvePackagePath } = require('./helper/utils');

const { name } = require('../package.json');

module.exports = {
    name,
    plugins: [
        // json(),
        // yaml(),
        // vuePlugin(),
    ],
    async afterBuild (dirName) {
        if (dirName !== 'types') return;
        copyFile({
            src: '#types/src/extend.d.ts',
            dest: '#types/dist/extend.d.ts',
        });
        copyFile({
            src: '#types/dist/sener-types.d.ts',
            handler: (content) => `import "./extend.d";\n${content}`,
        });
    },
    onBuildConfig (config, dirName, create, createDts) {
        if (dirName === 'rpc') {
            const input = resolvePackagePath(`${dirName}/src/rpc-web.ts`);
            config.push(
                create({
                    format: 'umd',
                    input,
                    bundleName: 'web.umd.js',
                }),
                create({
                    format: 'esm',
                    input,
                    bundleName: 'web.esm.js',
                }),
                create({
                    format: 'iife',
                    input,
                    bundleName: 'web.iife.js',
                }),
                createDts(input, 'web.umd.d.ts'),
            );
        }
    },
    buildFormats: [
        'cjs', 'esm'
    ],
    packageMain: 'cjs',
    packageModule: 'esm',
    handlerBuildPackage (package, dirName) {
        if (dirName === 'rpc') {
            package.unpkg = `dist/web.iife.js`;
            package.jsdelivr = `dist/web.iife.js`;
        }
    }
};