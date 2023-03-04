/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */

const execa = require('execa');
const { resolveRootPath } = require('../../scripts/helper/utils');

const arg = process.argv[2];

const config = [
    '-c',
    resolveRootPath('services/web-request/rollup.web.config.js'),
];

if (arg === 'watch') {
    config.push(
        '--environment',
        [ 'DEV:true' ],
        '--watch'
    );
}

async function build () {
    // if (dirName !== 'test') return;
    await execa(
        resolveRootPath('node_modules/rollup/dist/bin/rollup'),
        config,
        { stdio: 'inherit' },
    );
}

async function main () {
    await build();
}

main();


