/*
 * @Author: chenzhongsheng
 * @Date: 2024-05-28 22:05:10
 * @Description: Coding something
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');


function main () {

    const version = process.argv[2];

    if (!version) {
        throw new Error('Invalid version');
    }
    execSync(`npx lerna version ${version} --no-git-tag-version --force-publish --yes`);
    // console.log('Build ...');
    // execSync('npm run build');
    // console.log('Build Docs ...');
    // execSync('npm run build:docs');

    console.log('Publish ...');

    // execSync('cd ./packages/types && npm publish');

    const list = fs.readdirSync(path.resolve(__dirname, '../packages'));

    for (const name of list) {
        if (name === 'types') {
            continue;
        }
        console.log(`Publish ${name}`);
        execSync(`cd ${path.resolve(__dirname, `../packages/${name}`)} && npm publish`);

    }
}

main();