/*
 * @Author: chenzhongsheng
 * @Date: 2022-11-20 18:49:51
 * @Description: Coding something
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-12 23:08:12
 */
const fs = require('fs');
const { resolveRootPath } = require('../helper/utils');

if (!fs.existsSync(resolveRootPath('docs')))
    fs.mkdirSync(resolveRootPath('docs'));

fs.copyFileSync(
    resolveRootPath('README.md'),
    resolveRootPath('docs/README.md')
);
fs.copyFileSync(
    resolveRootPath('.gitignore'),
    resolveRootPath('docs/.gitignore')
);

// // ! github ci 构建中 会有一个莫名的 undefined 依赖不知道哪里来的
// if (pkg.dependencies['undefined']) {
//     delete pkg.dependencies['undefined'];
//     writeJsonIntoFile(pkg, '#sener/package.json');
// }