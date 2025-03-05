Here’s the **golden command list** and **explanations** for fixing and persisting the LXD mDNS issue. This captures all essential steps based on your outputs and final solution.

---

### **1. Check Current mDNS and Network Status**

#### Command:

```bash
avahi-browse -a -t
```

**What to Check:**

- Ensure the LXD bridge interface (`lxdbr0`) shows up in the output.
- Look for services on `lxdbr0` (e.g., Workstation or mDNS).

#### Command:

```bash
sudo iptables -L -v
```

**What to Check:**

- Verify there are no `DROP` rules for UDP port 5353 in `INPUT`, `OUTPUT`, or `FORWARD`.
- If present, ensure `ACCEPT` rules for port 5353 come **before** any `DROP` rules.

---

### **2. Add Firewall Rules for mDNS (if Needed)**

#### Commands:

```bash
sudo iptables -A INPUT -p udp --dport 5353 -j ACCEPT
sudo iptables -A OUTPUT -p udp --sport 5353 -j ACCEPT
sudo iptables -A FORWARD -p udp --dport 5353 -j ACCEPT
```

**Explanation:**

- These rules allow incoming, outgoing, and forwarded mDNS traffic over UDP port 5353.
- Only required if you notice `DROP` rules affecting mDNS.

#### Persist the Rules:

```bash
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

**What It Does:**

- Saves the current iptables rules for persistence across reboots.

---

### **3. Ensure Multicast is Enabled on `lxdbr0`**

#### Command:

```bash
ip link show lxdbr0
```

**What to Check:**

- Confirm `MULTICAST` appears in the output (e.g., `<BROADCAST,MULTICAST,UP>`).
- If not, recreate the bridge with multicast support.

---

### **4. Check and Restart Avahi Daemon**

#### Command:

```bash
sudo systemctl status avahi-daemon
```

**What to Check:**

- Ensure the Avahi daemon is running without errors.
- Restart it if necessary.

#### Restart Command:

```bash
sudo systemctl restart avahi-daemon
```

---

### **5. Update `avahi-daemon.conf` to Bind to `lxdbr0`**

#### Command:

```bash
sudo nano /etc/avahi/avahi-daemon.conf
```

**Add or Modify the Following Lines:**

```ini
allow-interfaces=lxdbr0
```

#### Restart Avahi Daemon:

```bash
sudo systemctl restart avahi-daemon
```

---

### **6. Verify mDNS Resolution**

#### Command:

```bash
ping actman-instance.local
```

**What to Check:**

- The container's `.local` hostname should resolve to its IP (e.g., `10.112.160.68`).

#### Optional: Verify SSH Access

```bash
ssh -i ~/.ssh/local-staging-ed25519 mediavmuser@actman-instance.local
```

---

### **When to Persist `iptables` Rules Again**

Run the following whenever you modify `iptables` rules (e.g., for port 5353):

```bash
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

This ensures all newly added rules (e.g., mDNS-related) are saved for reboot.

---

### **Final Golden Command List**

```bash
avahi-browse -a -t
sudo iptables -L -v

# If necessary, add mDNS rules
sudo iptables -A INPUT -p udp --dport 5353 -j ACCEPT
sudo iptables -A OUTPUT -p udp --sport 5353 -j ACCEPT
sudo iptables -A FORWARD -p udp --dport 5353 -j ACCEPT

# Persist iptables rules
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# Check multicast on lxdbr0
ip link show lxdbr0

# Check and restart Avahi daemon
sudo systemctl status avahi-daemon
sudo systemctl restart avahi-daemon

# Update avahi-daemon.conf
sudo nano /etc/avahi/avahi-daemon.conf
# Add: allow-interfaces=lxdbr0
sudo systemctl restart avahi-daemon

# Verify mDNS and SSH
ping actman-instance.local
ssh -i ~/.ssh/local-staging-ed25519 mediavmuser@actman-instance.local
```

By following this sequence, you ensure that your LXD containers have proper mDNS functionality and network connectivity every time.
