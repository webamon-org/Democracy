#!/bin/bash

# Start NordVPN using the token
echo "Logging into NordVPN using token..."
nordvpn login --token $NORDVPN_TOKEN

# Connect to the VPN
nordvpn connect

# Ensure the VPN is connected before continuing
sleep 10

# Show network info for debugging
echo "Network interfaces:"
ip a

echo "Routing table:"
ip route

# Run the main Python application
echo "Starting Webamon Sandbox application..."
exec python webamon-sandbox.py
