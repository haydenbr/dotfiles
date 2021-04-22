#! /bin/sh

brew install --cask slack
brew install --cask zoom
brew install --cask vscodium
brew install --cask docker
brew install kubernetes-cli

brew tap federico-terzi/espanso
brew install espanso
espanso --version
espanso register