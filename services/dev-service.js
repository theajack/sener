/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */

const { exec } = require('../scripts/helper/utils');

let serviceName = process.argv[2];

if (!serviceName) {
    console.warn('未输入serviceName， 将采用默认值');
    serviceName = 'comment';
}

console.log(`serviceName=${serviceName}`);


async function main () {
    let isOpen = false;
    await exec(`npm run devbase --sample=${serviceName}`, (data) => {
        if (isOpen) return;
        const url = data.match(/http:\/\/localhost:[0-9]+/);
        if (url) {
            isOpen = true;
            exec(`npx open-cli ${url[0]}`);
        }
    });
}

main();


