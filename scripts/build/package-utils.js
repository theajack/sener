/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 12:16:35
 * @Description: Coding something
 */

const rootPkg = require('../../package.json');
const { copyFile, traverseDir, resolveRootPath } = require('../helper/utils');
const { name, handlerBuildPackage, packageMain, packageModule } = require('../build.config');

function buildPackageName (dir) {
    if (!dir) return name;
    return dir === name ? dir : `${name}-${dir}`;
}
function initSinglePackageInfo (dir, isDev = false) {
    copyFile({
        src: `#${dir}/package.json`,
        json: true,
        handler (package) {
            const packageName = buildPackageName(dir);

            if (isDev) {
                package.main = 'src/index.ts';
                package.typings = 'src/index.ts';
            } else {
                package.main = `dist/${packageName}.${packageMain || 'iife'}.js`;
                package.module = `dist/${packageName}.${packageModule || 'esm'}.js`;
                package.typings = `dist/${packageName}.d.ts`;
                if (handlerBuildPackage) handlerBuildPackage(package, packageName);
            }
            [
                'description', 'author', 'repository',
                'license', 'publishConfig'
            ].forEach(name => {
                package[name] = rootPkg[name];
            });
            return package;
        }
    });

    copyFile({ src: '@README.md', dest: `#${dir}/README.md` });
    copyFile({ src: '@LICENSE', dest: `#${dir}/LICENSE` });
    copyFile({ src: '@scripts/helper/.npmignore', dest: `#${dir}/.npmignore` });

    copyFile({
        src: '@tsconfig.json',
        dest: `#${dir}/tsconfig.json`,
        json: true,
        handler (tsconfig) {
            tsconfig.include = [ 'src/**/*' ];
            tsconfig.compilerOptions.rootDir = '../..';
            return tsconfig;
        }
    });
}
function initPackageInfo (isDev) {
    traverseDir(resolveRootPath('packages'), (dir) => {
        initSinglePackageInfo(dir, isDev);
    });
}

module.exports = {
    initPackageInfo,
    buildPackageName,
    initSinglePackageInfo
};