/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
 */
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                targets: {
                    esmodules: true,
                    ie: 11,
                },
            },
        ],
        '@babel/preset-typescript',
    ],
};

