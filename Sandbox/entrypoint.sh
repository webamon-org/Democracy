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

# Enable IP forwarding
echo "Enabling IP forwarding..."
sysctl -w net.ipv4.ip_forward=1

# Ensure that LAN traffic (192.168.1.0/24) bypasses the VPN and goes through eth0
echo "Setting up split tunneling for LAN traffic (192.168.1.0/24)..."
ip route add 192.168.1.0/24 via 192.168.1.1 dev $LOCAL_IFACE

# Ensure all other traffic goes through the VPN
echo "Setting default route for all other traffic to go through VPN ($VPN_IFACE)..."
ip route del default
ip route add default via 10.100.0.1 dev $VPN_IFACE

# Setup NAT (Network Address Translation) to allow outbound traffic through VPN (tun0)
echo "Setting up iptables for NAT and LAN access..."
iptables -t nat -A POSTROUTING -o $VPN_IFACE -j MASQUERADE

# Allow traffic forwarding between eth0 and tun0
iptables -A FORWARD -i $LOCAL_IFACE -o $VPN_IFACE -j ACCEPT
iptables -A FORWARD -i $VPN_IFACE -o $LOCAL_IFACE -m state --state RELATED,ESTABLISHED -j ACCEPT

# Allow incoming traffic on port 5000 from LAN interface (eth0)
iptables -A INPUT -i $LOCAL_IFACE -p tcp --dport 5000 -j ACCEPT

# Show iptables rules for debugging
echo "Current iptables rules:"
iptables -L -n -v
iptables -t nat -L -n -v

# Show routing table after applying split tunneling rule
echo "Routing table after adding split tunneling rules:"
ip route

# Test if port 5000 is accessible inside the container
echo "Testing internal access to port 5000..."
curl http://localhost:5000 || echo "Port 5000 is not reachable internally"

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
