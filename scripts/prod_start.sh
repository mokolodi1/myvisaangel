#!/bin/bash

if [ -z "$BOX_NUMBER" ]; then
  echo "usage on prod: BOX_NUMBER=b4 ./scripts/prod_start.sh";
  exit 1;
fi

npm install

# show stderr on command line and save stderr/out to a log file
# https://unix.stackexchange.com/a/80004/98645
# use --preserve-env to keep BOX_NUMBER
sudo --preserve-env npm run prod 2>&1 >>~/chatbot_logs.txt | tee -a ~/chatbot_logs.txt
