Setup deploy
-

$ssh-keygen -t rsa -b 4096 -C "circleci-yvm-deploy@tophat.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/jakebolam/.ssh/id_rsa): /code/yvm/github-deploy
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /code/yvm/github-deploy.
Your public key has been saved in /code/yvm/github-deploy.pub.
The key fingerprint is:
SHA256:NWkgjnDZrD4p1aqI4XKYxdJzV0zpDLhXq0eFcENDZ0g circleci-yvm-deploy@tophat.com


Go to https://github.com/tophat/yvm/settings/keys/new
Add new key
(add public content here)
Allow write access and add


In circleci: https://circleci.com/gh/tophat/yvm/edit#ssh
Add SSH key
hostname github.com
Private key contents

Add the fingerprint to the circleci file e.g. 'e4:57:c7:5a:d1:6f:a9:23:20:fe:5f:bb:77:39:33:bb'
