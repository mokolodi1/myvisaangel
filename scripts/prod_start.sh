#!/bin/bash

npm install

# show on command line and also save into a log file
sudo npm run prod |& tee -a ~/chatbot_logs.txt
