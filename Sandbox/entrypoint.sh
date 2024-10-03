#!/bin/bash

# Start NordVPN service
echo "Starting NordVPN service..."
/etc/init.d/nordvpn start

# Login to NordVPN using the token
echo "Login to NordVPN using token..."
nordvpn login --token $NORDVPN_TOKEN

# Set VPN technology to NordLynx (or other preferences)
nordvpn set technology nordlynx

# Connect to NordVPN
echo "Connecting to NordVPN..."
nordvpn connect

# Wait for the VPN connection to establish
sleep 5

# Check VPN status
nordvpn status

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
