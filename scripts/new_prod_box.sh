# Install node, npm, tmux
# TODO: unclear if we need both nodejs and nodejs-legacy
sudo apt-get update
sudo apt-get install -y nodejs nodejs-legacy npm tmux emacs24

# Install Teo's tmux conf file
git clone https://github.com/mokolodi1/dotfiles ~/dotfiles
~/dotfiles/install.sh

# Install the right version of node (so we can use es6)
sudo npm install -g n
sudo n 8.4.0 # might be latest instead of that number

# Install dependancies
npm install --no-optional

echo "All done and ready to go :)"
