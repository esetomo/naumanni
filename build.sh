#!/bin/sh

set -ex

git checkout master
git fetch upstream
git merge --ff-only upstream/master
yarn
yarn build
cp www/index.html index.html
cp www/favicon.ico favicon.ico
ruby -i -pe '$_.gsub!("/static/", "/naumanni/static/")' index.html
git checkout gh-pages
