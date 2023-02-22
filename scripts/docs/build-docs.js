/*
 * @Author: chenzhongsheng
 * @Date: 2022-11-20 18:49:51
 * @Description: Coding something
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-21 23:16:31
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