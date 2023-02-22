/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 14:19:52
 * @Description: Coding something
 */
const { buildPackageName } = require('./build/package-utils');
const { exec } = require('./helper/utils');
buildPackageName;
const pkgName = process.argv[2];
const scope = buildPackageName(process.argv[3]);

exec(`npx lerna add ${pkgName} --scope=${scope}`);