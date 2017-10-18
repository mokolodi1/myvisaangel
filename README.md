# My Visa Angel API [![Build Status](https://travis-ci.com/mokolodi1/myvisaangel.svg?token=gSskbph9XcxTrDMf2BS7&branch=master)](https://travis-ci.com/mokolodi1/myvisaangel) [![codecov](https://codecov.io/gh/mokolodi1/myvisaangel/branch/master/graph/badge.svg?token=QcWtpXLB60)](https://codecov.io/gh/mokolodi1/myvisaangel)

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

# Checking test coverage
npm run coverage
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

1. Create a new EC2 box. (Ubuntu Server 16.04 LTS)
2. Add the IP to the DNS on [hover.com](https://hover.com).
3. Add port 80 (HTTP) to the inbound rules for the security group.
4. Connect: `ssh -i myvisaangel.pem ubuntu@b1.myvisaangel.com`
5. Do the following:

```sh
# Grab the code from GitHub and go into the code's folder
git clone https://github.com/mokolodi1/myvisaangel
cd myvisaangel

# Install stuff
./scripts/new_prod_box.sh

# Start a new tmux session so the command keeps running
# after you close the window
tmux

# Optional: do C-b " to split the tmux window into two. (Hold control and
# press B, release everything, and then press ")

# Start it up!
# NOTE: use beta_start.sh for betas so they don't write to prod logs, and you
#       don't have to specify the BOX_NUMBER for that
BOX_NUMBER=b4 ./scripts/prod_start.sh
```

6. Give it a shot: http://b2.myvisaangel.com/v1/ping

### Deploying the beta

1. Test `MVA Beta`, start watching the logs for the beta
2. Disconnect the beta bot from `MVA Beta` on Chatfuel
3. Disconnect the old prod bot from `My Visa Angel` on Chatfuel
4. Connect the beta bot to `My Visa Angel` on Chatfuel
5. Test `My Visa Angel` (the new production bot)
6. Change `api.myvisaangel.com` IP to the latest IP on [Hover](https://www.hover.com/control_panel/domain/myvisaangel.com/dns)
7. Rename `My Visa Angel N production` to `archive`
8. Rename `My Visa Angel N beta` to `production`
9. Stop watching logs or the now-production bot

## Manu is down! Help!

Hello person providing emergency assistance to Manu! Thanks so much in advance for helping out.

#### Start here

We're running a Node/Express app on an AWS box that connects with Chatfuel via an HTTP API. No databases or anything, and the node app isn't even built - super simple.

Each version of the chatbot is versioned, and you can find the production version on the Chatfuel dashboard by looking for `My Visa Angel N production`, where `N` is the version. At the time of writing, the production version is `4`, so that's what'll be used from here on out.

The URL for the AWS box that hosts the API is `b4.myvisaangel.com`. The `4` in `b4` refers to the version of the app. (The whole `b4` business is a little funky, I know. I'll explain the reasoning when I'm back online. - Teo)

Grab the `myvisaangel.pem` file from Paola or Abdel (the one on Slack) and get connected to our server: `ssh -i ~/Downloads/myvisaangel.pem ubuntu@b4.myvisaangel.com`.

The app is running in a tmux session, and you can connect with `tmux a`. (This is the first command you should type.)

From there you should be able to see more or less what the problem is. If you've never used tmux it might be a little funky, but scrolling should work more or less. If you ever get stuck scrolling with the yellow box in the upper right, use `C-c` to stop scrolling. (`C-c` means type `c` while holding the control key.)

To start the app, the command should look something like this: `BOX_NUMBER=b4 ./scripts/prod_start.sh`.

Test if the API is up by checking this page: [http://b4.myvisaangel.com/v1/ping](http://b4.myvisaangel.com/v1/ping)

#### More potentially useful information

The two sections in this README about setting up a new box and deploying should provide you some more information as to how things are managed.

The DNS for `myvisaangel.com` is managed on [Hover](https://www.hover.com/control_panel/domain/myvisaangel.com/dns). The email is `mokolodi1@gmail.com`, and you can get the password from Paola.

Teo (aka `mokolodi1`) is the admin of the GitHub repo, so you won't be able to push anything to `master` if you edit locally. Feel free to deploy on a branch if you have to set up a new box.

If you change the url for the production box you'll have to change it on Chatfuel in each of the places it connects to the API. Paola should be able to help with that.

#### TODO list for Teo if this action plan is ever used
- change the `.pem` files for the production boxes on AWS
- change my Hover password
- buy whoever helped us a beer
