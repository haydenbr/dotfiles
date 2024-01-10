#! /bin/sh

bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew update

brew install kubernetes-cli \
	md5sha1sum \
	awscli \
	jq \
	openssl \
	go \
	coreutils \
	saml2aws \
	graphviz \
	ghostscript \
	terraform

brew install --cask slack \
	zoom \
	visual-studio-code \
	docker \
	firefox \
	google-chrome \
	iterm2 \
	wireshark \
	protonvpn \
	yubico-authenticator \
	aws-vpn-client \
	drawio \
	microsoft-remote-desktop \
	postman \
	remarkable \
	vlc \
	drawio \
	datagrip


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

# rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
