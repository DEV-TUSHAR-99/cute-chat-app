# Ngrok Installation Guide

## Method 1: Using npm (Easiest)

```bash
# Install globally
npm install -g ngrok

# Verify installation
ngrok --version
```

---

## Method 2: Direct Download

### For Linux (ARM64 - This Server):
```bash
# Download
curl -LO https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz

# Extract
tar xvzf ngrok-v3-stable-linux-arm64.tgz

# Move to bin
sudo mv ngrok /usr/local/bin/

# Verify
ngrok --version
```

### For Linux (AMD64):
```bash
curl -LO https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

### For Windows:
1. Download: https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip
2. Extract zip
3. Add to PATH

### For Mac:
```bash
# Intel Mac
curl -LO https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip
unzip ngrok-v3-stable-darwin-amd64.zip
sudo mv ngrok /usr/local/bin/

# M1/M2 Mac
curl -LO https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip
unzip ngrok-v3-stable-darwin-arm64.zip
sudo mv ngrok /usr/local/bin/
```

---

## Method 3: Termux (Android)

```bash
# Update packages
pkg update

# Install ngrok
pkg install ngrok

# Or use snap
apt install snapd
snap install ngrok
```

---

## Setup Auth Token (Required)

1. Sign up: https://dashboard.ngrok.com/signup
2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure:

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

---

## Usage

```bash
# HTTP tunnel
ngrok http 3000

# Custom subdomain (paid)
ngrok http --subdomain=cutechat 3000

# TCP tunnel
ngrok tcp 3000
```

---

## Alternative: LocalTunnel (No signup needed)

```bash
npm install -g localtunnel

# Use
lt --port 3000 --subdomain cutechat123
```

---

## Alternative: Cloudflare Tunnel

```bash
# Download
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -O cloudflared
chmod +x cloudflared

# Run
./cloudflared tunnel --url http://localhost:3000
```
