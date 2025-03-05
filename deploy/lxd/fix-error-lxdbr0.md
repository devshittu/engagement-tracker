Here is the collated list of commands that successfully brought up `custombr0`:

```bash
sudo ip link add name custombr0 type bridge
sudo ip link set custombr0 up
lxc network edit custombr0


```

This sequence ensures the `custombr0` bridge is created, activated, and its configuration is synchronized with LXD.


Here’s your **golden command markdown note** that you can use to fix LXD container network issues in the future. This guide is structured step-by-step and explains what to expect at each stage.

---

# LXD Container Networking Fix Guide

## **1. Switch to LXD and Restart the Daemon**
If network issues persist, restart the LXD daemon to ensure changes are applied.

```bash
sudo systemctl restart snap.lxd.daemon
```

**What to expect:**
- No output if successful. Proceed to the next step.

---

## **2. Check LXD Networks**
List all available networks to verify the bridges are created.

```bash
lxc network ls
```

**Expected output:**
You should see your networks listed, e.g.:

```
+-----------+----------+---------+-----------------+--------------------------+-------------+---------+---------+
|   NAME    |   TYPE   | MANAGED |      IPV4       |           IPV6           | DESCRIPTION | USED BY |  STATE  |
+-----------+----------+---------+-----------------+--------------------------+-------------+---------+---------+
| lxdbr0    | bridge   | YES     | 10.112.160.1/24 | fd42:eaa:4aa8:4503::1/64 |             | 2       | CREATED |
| custombr0 | bridge   | YES     | 10.50.0.1/24    | none                     |             | 2       | CREATED |
+-----------+----------+---------+-----------------+--------------------------+-------------+---------+---------+
```

---

## **3. Verify Network Bridge Configuration**
Check if your bridge has the correct DHCP and NAT settings.

```bash
lxc network show lxdbr0
```

**Expected output:**
Ensure the following fields exist in the configuration:

```yaml
config:
  ipv4.address: 10.112.160.1/24
  ipv4.dhcp: "true"
  ipv4.nat: "true"
  ipv6.address: fd42:eaa:4aa8:4503::1/64
  ipv6.nat: "true"
```


---

### **1. Enable DHCP for `lxdbr0`**
From your `lxc network show lxdbr0`, it appears DHCP is missing from the configuration. To enable it:

```bash
lxc network set lxdbr0 ipv4.dhcp true
```

---

### **2. Restart the Network**
After enabling DHCP, restart the `lxdbr0` network to apply changes:

```bash
sudo systemctl restart snap.lxd.daemon
```

---

### **3. Verify DHCP Lease**
Check if the container receives an IP address:

```bash
lxc exec actman-instance -- ip a
```

You should see an IP address in the range `10.112.160.0/24` assigned to `eth0`.

If the container does not have an IP address, restart it and recheck:

```bash
lxc restart actman-instance
lxc exec actman-instance -- ip a
```

---

### **4. Verify Internet Access**
Once the container has an IP address, test internet connectivity:

```bash
lxc exec actman-instance -- ping -c 4 8.8.8.8
lxc exec actman-instance -- ping -c 4 google.com
```

If the ping to `8.8.8.8` works but `google.com` does not, the DNS configuration needs fixing.

---

### **5. Fix DNS Configuration**
If DNS is not resolving:

1. Check the container's `/etc/resolv.conf`:

   ```bash
   lxc exec actman-instance -- cat /etc/resolv.conf
   ```

2. If it’s empty or incorrect, set a static nameserver:

   ```bash
   lxc network set lxdbr0 dns.nameservers 8.8.8.8
   ```

   Restart the container to apply the change:

   ```bash
   lxc restart actman-instance
   ```

   Recheck `/etc/resolv.conf` in the container, and it should now have `8.8.8.8`.

---

### **6. Verify Firewall and NAT**
Your `iptables` rules look correct, but confirm NAT is applied for `lxdbr0`:

```bash
sudo iptables -t nat -L POSTROUTING | grep 10.112.160.0
```

You should see:

```
MASQUERADE  all  --  10.112.160.0/24  anywhere
```

If it’s missing, add the rule:

```bash
sudo iptables -t nat -A POSTROUTING -s 10.112.160.0/24 ! -d 10.112.160.0/24 -j MASQUERADE
```

---

## **4. Enable IP Forwarding**
Ensure IP forwarding is enabled on the host.

```bash
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**What to expect:**
Output should confirm the IP forwarding setting:

```
net.ipv4.ip_forward = 1
```

---

## **5. Set Up IP Tables for NAT**
Add a NAT rule for your LXD bridge (`lxdbr0`) to enable internet access.

```bash
sudo iptables -t nat -A POSTROUTING -s 10.112.160.0/24 ! -d 10.112.160.0/24 -j MASQUERADE
```

**What to expect:**
- No output. Verify the rule is added by listing NAT rules.

```bash
sudo iptables -t nat -L POSTROUTING -v | grep 10.112.160.0
```

**Expected output:**
```
0     0 MASQUERADE  all  --  any    any     10.112.160.0/24     !10.112.160.0/24
```

---

## **6. Adjust Forwarding Rules**
Set the default FORWARD policy to `ACCEPT` and allow forwarding between `lxdbr0` and your external interface (e.g., `eno1`).

```bash
sudo iptables -P FORWARD ACCEPT
sudo iptables -A FORWARD -i lxdbr0 -o eno1 -j ACCEPT
sudo iptables -A FORWARD -i eno1 -o lxdbr0 -m state --state RELATED,ESTABLISHED -j ACCEPT
```

**What to expect:**
- No output. Verify the rules by listing the `FORWARD` chain:

```bash
sudo iptables -L FORWARD -v
```

**Expected output:**
```
pkts bytes target     prot opt in     out     source               destination         
0     0 ACCEPT     all  --  lxdbr0  eno1    anywhere             anywhere
0     0 ACCEPT     all  --  eno1    lxdbr0  anywhere             anywhere             state RELATED,ESTABLISHED
```

---

## **7. Save IP Tables Rules**
Make the IP tables rules persistent across reboots.

```bash
sudo apt-get install iptables-persistent -y
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

**What to expect:**
- Confirmation of successful saving.

---

## **8. Restart Containers**
Restart the container to apply the changes.

```bash
lxc restart <container-name>
```

Example:

```bash
lxc restart actman-instance
```

**What to expect:**
- The container restarts without errors.

---

## **9. Test Internet Connectivity in the Container**
Ping a public IP from inside the container.

```bash
lxc exec actman-instance -- ping -c 4 8.8.8.8
```

**Expected output:**
```
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=116 time=12.5 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=116 time=10.4 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=116 time=18.3 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=116 time=8.20 ms

--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms
rtt min/avg/max/mdev = 8.201/12.357/18.310/3.761 ms
```

---

## **Summary of Commands**

```bash
# Restart LXD daemon
sudo systemctl restart snap.lxd.daemon

# Check networks
lxc network ls
lxc network show lxdbr0

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Add NAT rule
sudo iptables -t nat -A POSTROUTING -s 10.112.160.0/24 ! -d 10.112.160.0/24 -j MASQUERADE

# Adjust forwarding rules
sudo iptables -P FORWARD ACCEPT
sudo iptables -A FORWARD -i lxdbr0 -o eno1 -j ACCEPT
sudo iptables -A FORWARD -i eno1 -o lxdbr0 -m state --state RELATED,ESTABLISHED -j ACCEPT

# Save IP tables rules
sudo apt-get install iptables-persistent -y
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# Restart container
lxc restart actman-instance

# Test connectivity
lxc exec actman-instance -- ping -c 4 8.8.8.8
```

This should serve as a reliable reference for resolving future network connectivity issues in your LXD containers!