# Setup deploy

This document describes how to have CircleCI publish the yvm website from the docs folder to GitHub pages. CircleCI and GitHub communicate over SSH using an RSA key pair: the public key gets added as a deploy key to GitHub, and the private key gets added to CircleCI so it can push to GitHub.

## Create an SSH key pair on your local machine

```
$ ssh-keygen -m PEM -t rsa -b 4096 -C "circleci-yvm-deploy@tophat.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/jakebolam/.ssh/id_rsa): /code/yvm/github-deploy
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /code/yvm/github-deploy.
Your public key has been saved in /code/yvm/github-deploy.pub.
The key fingerprint is:
SHA256:NWkgjnDZrD4p1aqI4XKYxdJzV0zpDLhXq0eFcENDZ0g circleci-yvm-deploy@tophat.com
```

## Add the public key to GitHub as a deploy key

Go to GitHub: https://github.com/tophat/yvm/settings/keys/new
- Add new key
- Give it a name "Website deploy key"
- Add public key contents
- Check "Allow write access"
- Click "Add Key"

## Add the private key to CircleCI as an SSH key

Go to CircleCI: https://circleci.com/gh/tophat/yvm/edit#ssh
- Add SSH key
- Hostname: github.com
- Add private key contents
- Click "Add SSH Key"

After adding the private key, CircleCI will display the fingerprint (e.g. "31:a5:c5:3d:78:b9:79:1d:2f:4b:59:fd:e1:89:21:dc"). You'll need the fingerprint for the next step.

## Add the SSH key via its fingerprint to your build config

Add the fingerprint to the .circleci/config.yml file as a step in the website deploy, e.g.:

```
steps:
      # ... set up env
      # ... build website
      - add_ssh_keys:
          fingerprints:
            - "31:a5:c5:3d:78:b9:79:1d:2f:4b:59:fd:e1:89:21:dc"
      # ... deploy website
```
