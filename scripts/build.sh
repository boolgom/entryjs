#!/usr/bin/env bash
set -e # 에러 발생 시 스크립트 중단

git config --global user.name "Entry Dev";
git config --global user.email "entrydev@nts-corp.com";

export NODE_ENV=production
git clone -b build "https://github.com/$GITHUB_REPOSITORY" build
rm -rf build/**/* || exit 0
cp -r dist build/
cp -r extern build/
cp -r images build/
cp -r weights build/
rsync -R package.json build
rsync -R LICENSE build
rsync -R NOTICE build
rsync -R COPYING build
rsync -R README.md build
rsync -R README-en.md build
rsync -R src/playground/block_entry.js build
rsync -R src/playground/block_entry_mini.js build
rsync -r -R src/playground/blocks/ build
ls -al
ls -al build
