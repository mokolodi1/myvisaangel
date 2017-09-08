# My Visa Angel API [![Build Status](https://travis-ci.com/mokolodi1/myvisaangel.svg?token=gSskbph9XcxTrDMf2BS7&branch=master)](https://travis-ci.com/mokolodi1/myvisaangel)

## Getting started

### Downloading this code

```sh
# Take the code from GitHub and clone it to your local computer
git clone https://github.com/mokolodi1/myvisaangel

# Change your directory into the new folder you just created
cd myvisaangel

# Open the current directory in Finder (this will only work locally)
open .
```

### Editing this repo

First, make the changes you'd like to the API, either locally or on the
Amazon box.

To save your work to GitHub:

```sh
# Prepare all changes to be committed
# (you can also add specific files with git add filename)
git add -A

# Commit the changes
# Be sure to write meaningful commit messages - it's so
# helpful if you have to go back and change stuff!
# Good commit messages are less than 50 characters, so be
# descriptive but not verbose.
git commit -m "fixed incorrect salary information for Algerians"

# Get the latest code from GitHub
# You might get a scary message that you need to merge. If
# that happens just call Teo and he'll help you through it.
git pull origin master --rebase

# Push your changes to GitHub for safekeeping
git push origin master
```

Here's a couple more useful git commands you should try out

```
# View the current status of git - this will likely be
# your most useful command
git status

# In order to see what you've changed before you do `git add -A`:
git diff
```

### Starting the API server

Download the code and then:
```
# Install dependancies
npm install

# Start the server on port 3000 (the default port)
npm start
```

### Testing

Use the following commands to test the API:

```
# Make sure the dependancies have installed correctly
npm install

# Run the test suite
npm test
```

## AWS box

### How to connect to the AWS box

Open the command line and connect to the AWS box:

```sh
# Change the permissions for the .pem file - it yells at
# you if you don't do this. You only have to do this once
# for every time you download it.
# Don't forget to modify the path to the .pem file so it
# points to the right place.
chmod 500 ~/work/important-files/myvisaangel-prod.pem

# Connect to the box
ssh -i ~/work/important-files/myvisaangel-prod.pem ubuntu@api.myvisaangel.com

# Connect to the tmux session
tmux a
```

### Updating the code

Once connected to the AWS box, go to the shell that isn't currently running the server and run `git pull origin master` to pull all the latest code down from GitHub. Then you can go to the shell running the server and restart it by doing C-c (hold control and press C) and then calling the command to start the server (`sudo PORT=80 npm start`).

### Setting up a new box

Work in progress!

Add port 80 (HTTP) to the inbound rules for the security group.

Run these commands after connecting to your new AWS box.

```sh
# Install node, npm, tmux
# TODO: unclear if we need both nodejs and nodejs-legacy
sudo apt-get update
sudo apt-get install -y nodejs nodejs-legacy npm tmux

# Install Teo's tmux conf file
git clone https://github.com/mokolodi1/dotfiles
cp dotfiles/tilde_tmux.conf .tmux.conf

# Grab the code from GitHub and go into the code's folder
git clone https://github.com/mokolodi1/myvisaangel
cd myvisaangel

# Start a new tmux session so the command keeps running
# after you close the window
tmux

# Do C-b " to split the tmux window into two.
# (Hold control and press B, then press ")

# Install the right version of node (so we can use es6)
sudo npm install -g n
sudo n 8.4.0 # might be latest instead of that number

# Install dependancies
npm install --no-optional

# Start it up!
sudo PORT=80 npm start
```
