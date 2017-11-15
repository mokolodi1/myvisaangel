#!/bin/bash

if [ -z "$BOX_NUMBER" ]; then
  echo "usage on prod: BOX_NUMBER=b4 ./scripts/prod_start.sh";
  exit 1;
fi

npm install

sudo --preserve-env npm run beta 2>&1 >>~/chatbot_logs.txt | tee -a ~/chatbot_logs.txt
