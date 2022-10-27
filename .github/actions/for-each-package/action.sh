#!/bin/bash

cd packages || exit 1

rawDirs=(*)
dirs=("core" "${rawDirs[@]/core/}")

for d in "${dirs[@]}"; do
  [ "$d" != "" ] &&
    echo "packages/$d $1" &&
    (cd "$d" && eval "$1")
done

exit 0
