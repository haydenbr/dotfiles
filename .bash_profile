# PATH ENV variable
export PATH=/usr/local/bin:/usr/local/sbin:~/bin:$PATH
export PATH=/usr/local/lib/node_modules/cordova/bin:$PATH
export PATH=/usr/local/bin/bob:$PATH
export PATH=/usr/local/Cellar/python/2.7.13_1/bin:$PATH
export PATH=~/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

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

######## aliases ########

# apps
alias code='open -a /Applications/Visual\ Studio\ Code.app'
alias md='open -a /Applications/MacDown.app'
alias activ='open /Applications/Utilities/Activity\ Monitor.app'
alias v='code .'

# nand2tetris
alias HardwareSimulator='~/Projects/nand2tetris/tools/HardwareSimulator.sh'
alias CPUEmulator='~/Projects/nand2tetris/tools/CPUEmulator.sh'
alias Assembler='~/Projects/nand2tetris/tools/Assembler.sh'
alias VMEmulator='~/Projects/nand2tetris/tools/VMEmulator.sh'
alias JackCompiler='~/Projects/nand2tetris/tools/JackCompiler.sh'


# utilities
alias docker-host='docker run --rm -it --privileged --pid=host debian nsenter -t 1 -m -u -n -i sh'
alias tar_compress='tar czf'
alias tar_expand='tar xvzf'
alias show_hidden_true='defaults write com.apple.finder AppleShowAllFiles TRUE;killall Finder'
alias show_hidden_false='defaults write com.apple.finder AppleShowAllFiles FALSE;killall Finder'
alias time=' echo $(date + "%r")'
alias pyserve='python -m SimpleHTTPServer'
alias redux_on='export ENABLE_DEBUG_REDUX=true'
alias redux_off='unset ENABLE_DEBUG_REDUX'
alias npmplease🙏="echo 'rm -rf node_modules/ && rm -f package-lock.json && npm install'"

# git
alias gs='git status'
alias gc='git commit -m'
alias push-test='git checkout test && git pull && git rebase dev && git push && git checkout dev'

# ubt
alias linkme='${ASSISTANT_CLIENT_PATH}/symlink.sh'
alias anthem='export API_SERVER=http://haydenvm.local/Anthem.Api'
alias geared='export API_URL=http://haydenvm.local/Geared.Api'
alias pnc='export API_URL=http://haydenvm.local/Pnc.Api'
alias pro-dev='export PROFILE=Dev'
alias pro-test='export PROFILE=Test'
alias pro-prod='export PROFILE=Prod'
alias pro-uat='export PROFILE=Uat'
alias pro-unset='unset PROFILE'

# linux
alias ssh-evcu-test='ssh -i ~/.ssh/aws-ssh.pem ubuntu@54.242.119.172'

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/Users/haydenbraxton/miniconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/haydenbraxton/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/Users/haydenbraxton/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/Users/haydenbraxton/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

