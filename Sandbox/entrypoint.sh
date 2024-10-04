#!/bin/bash

# Ensure that the correct LAN route is added
ip route add 192.168.1.0/24 dev eth0 || echo "Failed to add route to 192.168.1.0/24"

# Show network interfaces and routing information for debugging
echo "Network interfaces:"
ip a

echo "Routing table before application starts:"
ip route

# Debugging internet connectivity via VPN
echo "Testing connectivity to Google DNS (8.8.8.8)..."
ping -c 4 8.8.8.8 || echo "Failed to connect to 8.8.8.8"

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
