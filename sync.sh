#!/bin/bash

# bash
ln -sf ~/Projects/dotfiles/.bash_profile ~/
source ~/.bash_profile

ln -sf ~/Projects/dotfiles/.bashrc ~/
source ~/.bashrc

# git
ln -sf ~/Projects/dotfiles/.gitconfig ~/
ln -sf ~/Projects/dotfiles/git-completion.bash ~/
source ~/git-completion.bash
ln -sf ~/Projects/dotfiles/git-prompt.sh ~/
source ~/git-prompt.sh

# espanso
rm -r ~/Library/Preferences/espanso
ln -s ~/Projects/dotfiles/espanso ~/Library/Preferences
espanso restart > /dev/null

# vscode keybindings
ln -sf ~/Projects/dotfiles/vscode/keybindings.json ~/Library/Application\ Support/Code/User/keybindings.json