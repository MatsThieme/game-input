#!/bin/bash

branch=$(git ls-remote --heads "https://github.com/$1" "release/$2" | cat);
if [[ ! -z "$branch" ]]; then
    echo "branch 'release/$2' not available";
    exit 15;
fi

npm_version=$(npm view @game-input/core versions | grep -o "'$2'" || echo "")
if [[ ! -z "$npm_version" ]]; then
    echo "npm package version '$2' is used";
    exit 16;
fi

exit 0
