#!/bin/bash

# Start OpenVPN using the NordVPN configuration
echo "Starting OpenVPN with NordVPN configuration..."
# Use the NordVPN email and password for authentication
echo -e "$NORDVPN_USER\n$NORDVPN_PASS" > /etc/openvpn/credentials.txt
openvpn --config /etc/openvpn/nordvpn.ovpn --auth-user-pass /etc/openvpn/credentials.txt &

# Wait for the VPN connection to establish
sleep 10

# Set up iptables to allow traffic on port 5000 to bypass the VPN
echo "Setting up iptables to allow LAN access to port 5000..."
VPN_IFACE=$(ip route | grep default | awk '{print $5}')
LOCAL_IFACE=$(ip route | grep -m1 -Eo 'dev [^ ]+' | awk '{print $2}')
iptables -t nat -A POSTROUTING -o $VPN_IFACE -j MASQUERADE
iptables -A FORWARD -i $LOCAL_IFACE -p tcp --dport 5000 -j ACCEPT

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
