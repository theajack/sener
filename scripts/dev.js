/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-14 08:06:30
 * @Description: Coding something
 */
const { build } = require('esbuild');
const { resolve } = require('path');
// const { yamlPlugin } = require('esbuild-plugin-yaml');
const { dtsPlugin } = require('esbuild-plugin-d.ts');
// const vuePlugin = require('esbuild-plugin-vue3');
const { name } = require('./build.config');

const outfile = resolve(__dirname, './dev/bundle.js');

const EntryMap = {
    [name]: './dev/index.ts',
};

console.log(process.argv);

let projectName = process.argv[2];

if (!projectName) {
    console.warn(`Dev 项目名称未指定，将使用默认项目 ${name}`);
    projectName = name;
}

const entry = EntryMap[projectName] || `./samples/${projectName}/index.ts`;

build({
    // entryPoints: [ resolve(__dirname, './dev/index.ts') ],
    entryPoints: [ resolve(__dirname, entry) ],
    outfile,
    bundle: true,
    sourcemap: true,
    format: 'cjs',
    globalName: name,
    platform: 'node',
    define: {
        'process.env.NODE_ENV': '"development"',
    },
    // plugins:
    //   format === 'cjs' || pkg.buildOptions?.enableNonBrowserBranches
    //     ? [nodePolyfills.default()]
    //     : undefined,
    // define: {
    //   __COMMIT__: '"dev"',
    //   __VERSION__: `"${pkg.version}"`,
    //   __DEV__: 'true',
    //   __TEST__: 'false',
    //   __BROWSER__: String(format !== 'cjs' && !pkg.buildOptions?.enableNonBrowserBranches),
    //   __GLOBAL__: String(format === 'global'),
    //   __ESM_BUNDLER__: String(format.includes('esm-bundler')),
    //   __ESM_BROWSER__: String(format.includes('esm-browser')),
    //   __NODE_JS__: String(format === 'cjs'),
    //   __SSR__: String(format === 'cjs' || format.includes('esm-bundler')),
    //   __COMPAT__: String(target === 'vue-compat'),
    //   __FEATURE_SUSPENSE__: 'true',
    //   __FEATURE_OPTIONS_API__: 'true',
    //   __FEATURE_PROD_DEVTOOLS__: 'false',
    // },
    plugins: [
        // yamlPlugin(),
        dtsPlugin(),
        // vuePlugin(),
    ],
    watch: {
        onRebuild (error) {
            if (!error) console.log(`rebuilt: ${outfile}`);
        },
    },
}).then(() => {
    console.log(`watching: ${outfile}`);
});
