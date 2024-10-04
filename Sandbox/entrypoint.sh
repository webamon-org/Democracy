#!/bin/bash

# Start OpenVPN using the NordVPN configuration
echo "Starting OpenVPN with NordVPN configuration..."
# Use the NordVPN email and password for authentication
echo -e "$NORDVPN_USER\n$NORDVPN_PASS" > /etc/openvpn/credentials.txt
openvpn --config /etc/openvpn/nordvpn.ovpn --auth-user-pass /etc/openvpn/credentials.txt &

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
