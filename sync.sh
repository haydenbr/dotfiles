#! /bin/sh

cp .bash_profile ~/.bash_profile
cp .bashrc ~/.bashrc
cp .gitconfig ~/.gitconfig
cp git-completion.bash ~/git-completion.bash
cp git-prompt.sh ~/git-prompt.sh
cp -r espanso ~/Library/Preferences
cp -r VSCodium/User ~/Library/Application\ Support/VSCodium

source ~/.bash_profile
espanso restart