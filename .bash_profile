# PATH ENV variable
export PATH=/usr/local/bin:/usr/local/sbin:~/bin:$PATH
export PATH=~/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

source ~/.bashrc

# Enable git tab completion
source ~/git-completion.bash

# bash completion
[ -f /usr/local/etc/bash_completion ] && . /usr/local/etc/bash_completion

# colors
export CLICOLOR=1
export LSCOLORS=GxFxCxDxBxegedabagaced
green="\[\033[0;32m\]"
cyan="\[\033[0;36m\]"
blue="\[\033[1;34m\]"
reset="\[\033[0m\]"

# Change command prompt
source ~/git-prompt.sh
export GIT_PS1_SHOWDIRTYSTATE=1
export PS1="$cyan\u$green\$(__git_ps1)$blue \W $ $reset"
