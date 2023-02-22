/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */

const execa = require('execa');
const { resolveRootPath } = require('./utils');

const dirName = process.argv[2];

console.log(`dirName=${dirName}`);

async function build () {
    // if (dirName !== 'test') return;
    await execa(
        resolveRootPath('node_modules/rollup/dist/bin/rollup'),
        [
            '-c',
            resolveRootPath('scripts/build/rollup.config.js'),
            '--environment',
            [
                `PACKAGE_NAME:${dirName}`,
                `NODE_ENV:production`,
            ],
        ],
        { stdio: 'inherit' },
    );
}

async function main () {
    await build();
    // ! 下面的逻辑放在 scripts 后面的步骤里做 否则会build失败
    // initSinglePackageInfo(dirName, false);
}

main();


