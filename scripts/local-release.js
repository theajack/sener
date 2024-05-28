/*
 * @Author: chenzhongsheng
 * @Date: 2024-05-28 22:05:10
 * @Description: Coding something
 */
const { execSync } = require('child_process');


function main () {

    const version = process.argv[2];

    if (!version) {
        throw new Error('Invalid version');
    }
    execSync(`npx lerna version ${version} --no-git-tag-version --force-publish --yes`);
    // console.log('Build ...');
    // execSync('npm run build');
    console.log('Build Docs ...');
    execSync('npm run build:docs');
    console.log('Publish ...');
    execSync('npx lerna publish from-package --yes');
}

main();