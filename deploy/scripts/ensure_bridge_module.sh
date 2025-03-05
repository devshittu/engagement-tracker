# #!/bin/bash

# set -e
# set -u


# # Prompt user for sudo password upfront
# sudo -v

# # Function to apply sysctl settings if not already set
# apply_sysctl_setting() {
#   local key="$1"
#   local value="$2"
#   local current_value

#   current_value=$(sysctl -n "$key" 2>/dev/null || echo "")

#   if [[ "$current_value" != "$value" ]]; then
#     echo "Applying sysctl setting $key=$value"
#     sudo sysctl -w "$key=$value"
#   else
#     echo "Sysctl setting $key already set to $value"
#   fi
# }

# echo "Ensuring bridge kernel module is loaded..."
# if ! lsmod | grep -q br_netfilter; then
#   echo "Loading br_netfilter module..."
#   sudo modprobe br_netfilter
# else
#   echo "br_netfilter module is already loaded."
# fi

# # Apply sysctl settings
# apply_sysctl_setting net.bridge.bridge-nf-call-iptables 1
# apply_sysctl_setting net.bridge.bridge-nf-call-ip6tables 1

# # Persist settings in /etc/sysctl.conf
# echo "Persisting sysctl settings..."
# if ! grep -q "^net.bridge.bridge-nf-call-iptables=1$" /etc/sysctl.conf; then
#   echo "net.bridge.bridge-nf-call-iptables=1" | sudo tee -a /etc/sysctl.conf
# else
#   echo "net.bridge.bridge-nf-call-iptables=1 already in /etc/sysctl.conf"
# fi

# if ! grep -q "^net.bridge.bridge-nf-call-ip6tables=1$" /etc/sysctl.conf; then
#   echo "net.bridge.bridge-nf-call-ip6tables=1" | sudo tee -a /etc/sysctl.conf
# else
#   echo "net.bridge.bridge-nf-call-ip6tables=1 already in /etc/sysctl.conf"
# fi

# # Reload sysctl settings
# echo "Reloading sysctl settings..."
# sudo sysctl -p

# echo "Bridge module and sysctl settings are configured."

#!/bin/bash

set -e
set -u

# Ensure br_netfilter is loaded
echo "Loading br_netfilter kernel module..."
sudo modprobe br_netfilter

# Apply sysctl settings
sudo sysctl -w net.bridge.bridge-nf-call-iptables=1
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=1

# Path: deploy/scripts/ensure_bridge_module.sh

