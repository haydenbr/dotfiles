# apps
alias code='open -a /Applications/Visual\ Studio\ Code.app'
alias md='open -a /Applications/MacDown.app'
alias activ='open /Applications/Utilities/Activity\ Monitor.app'
alias v='code .'
alias code='codium'

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
alias dotfiles='~/Projects/dotfiles/sync.sh'

# git
alias gs='git status'
alias gc='git commit -m'
alias push-test='git checkout test && git pull && git rebase dev && git push && git checkout dev'
