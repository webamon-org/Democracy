#!/bin/bash

# Ensure the correct LAN route is added
ip route add 192.168.1.0/24 dev eth0 || echo "Failed to add route to 192.168.1.0/24"

# Verify the routing table and interface setup
echo "Network interfaces:"
ip a

echo "Routing table before application starts:"
ip route

# Try to find VPN interface, but add a wait loop if not found initially
VPN_IFACE=""
for i in {1..10}; do
    VPN_IFACE=$(ip route | grep -o 'tun[0-9]')
    if [[ -n "$VPN_IFACE" ]]; then
        break
    fi
    echo "Waiting for VPN interface..."
    sleep 2
done

if [[ -z "$VPN_IFACE" ]]; then
    echo "VPN interface not found after waiting, exiting..."
    exit 1
fi

echo "VPN interface detected: $VPN_IFACE"

# Add default route through VPN
ip route replace default via $VPN_IFACE || echo "Failed to route traffic through VPN"

# Show updated routing table
echo "Routing table after adding VPN route:"
ip route

# Test internet connectivity through VPN
echo "Testing connectivity to Google DNS (8.8.8.8)..."
ping -c 4 8.8.8.8

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
