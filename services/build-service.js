/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */

const execa = require('execa');
const fs = require('fs');
const { resolveRootPath } = require('../scripts/helper/utils');

let serviceName = process.argv[2];

if (!serviceName) {
    console.warn('未输入serviceName， 将采用默认值');
    serviceName = 'comment';
}

async function build (name) {
    // if (dirName !== 'test') return;
    console.log(`Build start: serviceName=${name}`);
    await execa(
        resolveRootPath('node_modules/rollup/dist/bin/rollup'),
        [
            '-c',
            resolveRootPath('services/rollup.service.config.js'),
            '--environment',
            [
                `PACKAGE_NAME:${name}`,
                `NODE_ENV:production`,
            ],
        ],
        { stdio: 'inherit' },
    );
}

async function main () {
    if (serviceName === 'all') {
        const dir = fs.readdirSync(resolveRootPath('services/packages'));
        for (const name of dir) {
            if (name === 'dist') continue;
            await build(name);
        }
    } else {
        await build(serviceName);
    }
}

main();


