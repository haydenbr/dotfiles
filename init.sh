#! /bin/sh

bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew update

brew install kubernetes-cli
brew install md5sha1sum
brew install awscli
brew install jq
brew install openssl
brew install go
brew install coreutils

brew install --cask slack
brew install --cask zoom
brew install --cask visual-studio-code
brew install --cask docker
brew install --cask firefox
brew install --cask iterm2
brew install --cask wireshark
brew install --cask protonvpn
brew install --cask yubico-authenticator

brew tap federico-terzi/espanso
brew install espanso

brew upgrade

# nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# espanso
espanso --version
espanso register

