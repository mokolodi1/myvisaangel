#!/bin/bash

npm install

sudo npm run beta 2>&1 >>~/chatbot_logs.txt | tee -a ~/chatbot_logs.txt
