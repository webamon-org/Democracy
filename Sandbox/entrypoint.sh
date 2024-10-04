#!/bin/bash

ip route add 192.168.1.0/24 dev enp4s0

# Run the main Python application
echo "Starting the Webamon Sandbox application..."
exec python webamon-sandbox.py
