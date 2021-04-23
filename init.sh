#! /bin/sh

brew install --cask slack
brew install --cask zoom
brew install --cask vscodium
brew install --cask docker
brew install kubernetes-cli

# nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# espanso
brew tap federico-terzi/espanso
brew install espanso
espanso --version
espanso register