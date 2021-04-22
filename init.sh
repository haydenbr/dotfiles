#! /bin/sh

brew install --cask slack
brew install --cask zoom
brew install --cask vscodium
brew install docker

brew tap federico-terzi/espanso
brew install espanso
espanso --version
espanso register