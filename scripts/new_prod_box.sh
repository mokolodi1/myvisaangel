if [ -z "$BOX_NUMBER" ]; then
  echo "usage on prod: BOX_NUMBER=b4 ./myvisaangel/scripts/new_prod_box.sh";
  exit 1;
fi

# Set up certificate
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto
./certbot-auto certonly --standalone -d $BOX_NUMBER.myvisaangel.com

# Try to renew certificate every day
(crontab -l 2>/dev/null; echo "0 6 * * * /home/ubuntu/certbot-auto renew /home/ubuntu/certbot-auto renew --pre-hook "service nginx stop" --post-hook "service nginx start" --text--text >> /home/ubuntu/certbot-cron.log") | crontab -

# Install node, npm, tmux
# TODO: unclear if we need both nodejs and nodejs-legacy
sudo apt-get update
sudo apt-get install -y nodejs nodejs-legacy npm tmux emacs24 nginx

# Edit Nginx conf file and copy to correct directory
sudo cp myvisaangel/nginx.conf /etc/nginx/nginx.conf
sudo sed -i "s/BOX/$BOX_NUMBER/g" /etc/nginx/nginx.conf
sudo systemctl reload nginx

# Install Teo's tmux conf file
git clone https://github.com/mokolodi1/dotfiles ~/dotfiles
~/dotfiles/install.sh

# Install the right version of node (so we can use es6)
sudo npm install -g n
sudo n 8.4.0 # might be latest instead of that number

# Install dependancies
cd ~/myvisaangel
npm install --no-optional

echo "All done and ready to go :)"
