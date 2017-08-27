# My Visa Angel API

## Downloading this code

```sh
# Take the code from GitHub and clone it to your local computer
git clone https://github.com/mokolodi1/myvisaangel

# Change your directory into the new folder you just created
cd myvisaangel

# Open the current directory in Finder (this will only work locally)
open .
```

## Editing this repo

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

## Starting the API server

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
# Run the test suite
npm test
```

## Connecting to the AWS box

Open the command line and connect to the AWS box:

```sh
# Change the permissions for the .pem file - it yells at
# you if you don't do this.
chmod 500 ~/work/important-files/myvisaangel-prod.pem

# Connect to the box
# Don't forget to modify the path to the .pem file so it
# points to the right place.
ssh -i ~/work/important-files/myvisaangel-prod.pem ubuntu@api.myvisaangel.com

# Connect to the tmux session
tmux a
```

## Setting up a new AWS box

```
# Install node and npm
# TODO: unclear if we need both nodejs and nodejs-legacy
sudo apt-get install -y nodejs nodejs-legacy npm

```
