#! /bin/sh

bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew update

brew install --cask slack
brew install --cask zoom
brew install --cask visual-studio-code
brew install --cask docker
brew install kubernetes-cli
brew install --cask dotnet-sdk
brew install md5sha1sum
brew install --cask firefox
brew install --cask iterm2
brew install wireshark
brew install awscli
brew install jq
brew install openssl
brew tap federico-terzi/espanso
brew install espanso
brew install --cask postman

bnew upgrade

# nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# espanso
espanso --version
espanso register

