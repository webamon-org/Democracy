#!/bin/bash

# Start OpenVPN using the NordVPN configuration
echo "Starting OpenVPN with NordVPN configuration..."
echo -e "$NORDVPN_USER\n$NORDVPN_PASS" > /etc/openvpn/credentials.txt
openvpn --config /etc/openvpn/nordvpn.ovpn --auth-user-pass /etc/openvpn/credentials.txt &

# Wait for the VPN connection to establish
sleep 10

# Show network interfaces and routing information for debugging
echo "Network interfaces:"
ip a

echo "Routing table before adding iptables rules:"
ip route

# Detect VPN interface (usually tun0) and local interface (eth0)
VPN_IFACE=$(ip route | grep -m1 -o 'tun[0-9]')
LOCAL_IFACE=$(ip route | grep default | awk '{print $5}')

echo "VPN interface: $VPN_IFACE"
echo "Local interface: $LOCAL_IFACE"

# Set up iptables to allow traffic on port 5000 on eth0 (LAN interface)
echo "Setting up iptables to allow LAN access to port 5000..."
iptables -t nat -A POSTROUTING -o $VPN_IFACE -j MASQUERADE
iptables -A FORWARD -i $LOCAL_IFACE -p tcp --dport 5000 -j ACCEPT

# Show iptables rules for debugging
echo "Current iptables rules:"
iptables -L -n -v
iptables -t nat -L -n -v

# Optional: Add split tunneling rule to allow LAN traffic (assuming 192.168.1.0/24) to bypass the VPN
# Replace 192.168.1.0/24 with your actual LAN IP range if different
echo "Setting up split tunneling for local LAN traffic..."
ip route add 192.168.1.0/24 dev $LOCAL_IFACE

# Show routing table after applying split tunneling rule
echo "Routing table after adding iptables and split tunneling rules:"
ip route

# Test if port 5000 is accessible inside the container (internal connectivity)
echo "Testing internal access to port 5000..."
curl http://localhost:5000 || echo "Port 5000 is not reachable internally"

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
