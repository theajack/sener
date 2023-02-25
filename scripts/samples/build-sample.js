/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */

const execa = require('execa');
const { resolveRootPath } = require('../helper/utils');

let sampleName = process.argv[2];

if (!sampleName) {
    console.warn('未输入sampleName， 将采用默认值');
    sampleName = 'comment';
}

console.log(`sampleName=${sampleName}`);

async function build () {
    // if (dirName !== 'test') return;
    await execa(
        resolveRootPath('node_modules/rollup/dist/bin/rollup'),
        [
            '-c',
            resolveRootPath('scripts/samples/rollup.sample.config.js'),
            '--environment',
            [
                `PACKAGE_NAME:${sampleName}`,
                `NODE_ENV:production`,
            ],
        ],
        { stdio: 'inherit' },
    );
}

async function main () {
    await build();
}

main();


