/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 11:29:23
 * @Description: Coding something
 */
// const vuePlugin = require('rollup-plugin-vue');
// const yaml = require('@rollup/plugin-yaml');
// const json = require('@rollup/plugin-json');

const { copyFile } = require('./helper/utils');

const { name } = require('../package.json');

module.exports = {
    name,
    plugins: [
        // json(),
        // yaml(),
        // vuePlugin(),
    ],
    afterBuild (dirName) {
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
    buildFormats: [
        'cjs', 'esm'
    ],
    packageMain: 'cjs',
    packageModule: 'esm',
    // handlerBuildPackage(package, name){
    //   return package;
    // }
};