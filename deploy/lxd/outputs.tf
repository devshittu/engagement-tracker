
output "container_ip" {
  value = lxd_instance.container.ipv4_address
}


output "ssh_command" {
  value = "ssh -i ${var.ssh_private_key_path} ${var.ssh_username}@${var.use_mdns ?  "${var.instance_name}.local" : lxd_instance.container.ipv4_address}"
  description = "SSH command to access the LXD container"
}


output "lxc_mdns_hostname" {
#   value       = "media-app-instance.local"
  value       = "${var.instance_hostname}.local"
  description = "mDNS hostname for the LXC container"
}

