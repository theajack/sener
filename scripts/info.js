/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-14 08:06:30
 * @Description: Coding something
 */

const { extractPackagesInfo, writeJsonIntoFile } = require('./helper/utils');

const info = extractPackagesInfo();

writeJsonIntoFile(info, 'scripts/helper/packages-info.json');

console.log(info);
