#! /bin/sh

cp ~/Projects/dotfiles/.bash_profile ~/.bash_profile
cp ~/Projects/dotfiles/.bashrc ~/.bashrc
cp ~/Projects/dotfiles/.gitconfig ~/.gitconfig
cp ~/Projects/dotfiles/git-completion.bash ~/git-completion.bash
cp ~/Projects/dotfiles/git-prompt.sh ~/git-prompt.sh
cp -r ~/Projects/dotfiles/espanso ~/Library/Preferences

source ~/.bash_profile
espanso restart