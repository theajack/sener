/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 13:58:47
 * @Description: Coding something
 */
const fs = require('fs');
const { name } = require('./build.config');
const { initSinglePackageInfo } = require('./build/package-utils');
const { resolvePackagePath, writeStringIntoFile, writeJsonIntoFile } = require('./helper/utils');
const { version } = require('../package.json');

const dir = process.argv[2];

if (!dir) {
    throw new Error(`rep name is required`);
}

if (fs.existsSync(resolvePackagePath(dir))) {
    throw new Error(`rep is existed`);
}

fs.mkdirSync(resolvePackagePath(dir));

fs.mkdirSync(resolvePackagePath(`${dir}/src`));

writeStringIntoFile(`export default 'Hello ${dir}';`, `#${dir}/src/index.ts`, );

writeJsonIntoFile({
    name: `${name}-${dir}`,
    version,
    scripts: { build: `node ../../scripts/build/build.js ${dir}` },
    dependencies: {},
}, `#${dir}/package.json`, );

initSinglePackageInfo(dir, true);