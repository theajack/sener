<!--
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 10:47:40
 * @Description: Coding something
-->
## 1. ebuild

前置

1. 需要github action设置两个token
2. 需要github上配置 action permission

```
npm run dev
npm run build [version]

# 重新初始化dev环境
npm run init:dev

# 创建一个新包
npm run create <name>

# 安装monorepo依赖
npm run install <dep_name> <scope>

# 发包
npm run release <v*.*.*>

# 打印所有包信息
npm run info

# lerna 初始化包
npm run boot
```
## 2. [pnpm](https://zhuanlan.zhihu.com/p/373935751)

不使用 pnpm 的 workspace

<!-- 
pnpm i xxx -save-dev -w

pnpm i @test/utils -r --filter @test/ui

pnpm i xxx -r --filter @test/web

https://zhuanlan.zhihu.com/p/427588430

https://segmentfault.com/a/1190000040988970 -->

## 3. [lerna](https://www.lernajs.cn/)

```

lerna add xxx --scope=xxx

lerna version 0.0.1 --yes
lerna publish from-git --yes

lerna version prepatch --preid alpha --no-push

lerna init

lerna bootstrap

lerna diff [package?]

lerna ls

lerna changed

lerna run [script]
```

http://www.febeacon.com/lerna-docs-zh-cn/routes/commands/version.html#preid

查看包之间的依赖关系

yarn workspaces info 
