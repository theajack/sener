#!/bin/bash

# 检查参数版本
if [ -z "$1" ]; then
    echo "Invalid version"
    exit 1
fi
version="$1"

# 执行版本操作
npx lerna version "$version" --no-git-tag-version --force-publish --yes

# echo "Build..."
# npm run build

# echo "Build Docs..."
# npm run build:docs

echo "Publish..."

# # 发布特定包
cd ./packages/types
    
# npm publish

# 获取包列表
list=$(ls ..)

for name in $list
do
    if [ "$name" == "types" ]; then
        continue
    fi
    if [ "$name" == "config" ]; then
        continue
    fi
    echo "Publish $name"
    cd "../$name"
    npm publish
done