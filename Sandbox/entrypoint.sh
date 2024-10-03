#!/bin/bash

# Start OpenVPN using the NordVPN configuration
echo "Starting OpenVPN with NordVPN configuration..."
# Use the NordVPN token as the password for authentication
echo -e "$NORDVPN_USER\n$NORDVPN_TOKEN" > /etc/openvpn/credentials.txt
openvpn --config /etc/openvpn/nordvpn.ovpn --auth-user-pass /etc/openvpn/credentials.txt &

# Wait for the VPN connection to establish
sleep 10

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
