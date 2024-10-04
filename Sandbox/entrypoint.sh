#!/bin/bash

# Ensure the correct LAN route is added
ip route add 192.168.1.0/24 dev eth0 || echo "Failed to add route to 192.168.1.0/24"

# Verify the routing table and interface setup
echo "Network interfaces:"
ip a

echo "Routing table before application starts:"
ip route

# Check for VPN interface (tun0 is typical for NordVPN)
VPN_IFACE=$(ip route | grep -o 'tun[0-9]')
if [[ -z "$VPN_IFACE" ]]; then
    echo "VPN interface not found, exiting..."
    exit 1
fi

# Add default route through VPN
ip route replace default via $VPN_IFACE || echo "Failed to route traffic through VPN"

# Show updated routing table
echo "Routing table after adding VPN route:"
ip route

# Test internet connectivity through VPN
echo "Testing connectivity to Google DNS (8.8.8.8)..."
ping -c 4 8.8.8.8 || echo "Failed to connect to 8.8.8.8"

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
