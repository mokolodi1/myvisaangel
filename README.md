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

## Starting the server

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

## Setting up a new API server

Open the command line and connect to the AWS box:

```sh
# TODO
```