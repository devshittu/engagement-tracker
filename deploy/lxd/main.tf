terraform {
  required_providers {
    lxd = {
      source  = "terraform-lxd/lxd"
      version = "~> 1.0"
    }
  }
  required_version = ">= 1.0"
}

provider "lxd" {}

# Staging profile
resource "lxd_profile" "staging" {
  name        = local.instance_profile_label
  description = "Staging environment"

  config = {
    "security.nesting"    = "true"
    "security.privileged" = "true"
  }

  device {
    name = "eth0"
    type = "nic"
    properties = {
      nictype = "bridged"
      parent  = var.network_bridge
    }
  }

  device {
    name = "root"
    type = "disk"
    properties = {
      path = "/"
      pool = var.storage_pool
    }
  }
}


locals {
  # profiles = var.environment == "production" ? ["default", "production"] : ["default", "staging"]
  # profiles = ["default", "staging"]
  instance_profile_label = "${var.instance_name}-staging-profile"
  instance_hostname_label = "${var.instance_name}-host"
}

resource "lxd_instance" "container" {
  name     = var.instance_name
  image    = "${var.os_image}"
  profiles = [local.instance_profile_label]

  config = {
    "user.user-data" = <<-EOF
    #cloud-config
    hostname: ${var.instance_hostname}
    users:
      - name: ${var.ssh_username}
        groups: sudo
        shell: /bin/bash
        ssh-authorized-keys:
          - ${file(var.ssh_public_key_path)}
        sudo: ['ALL=(ALL) NOPASSWD:ALL']

    write_files:
      - path: /etc/profile.d/docker_env.sh
        content: |
          export DOCKER_HUB_TOKEN=${var.docker_hub_token}
          export DOCKER_HUB_USERNAME=${var.docker_hub_username}
        owner: root:root
        permissions: '0644'

    packages:
      - openssh-server
      - apt-transport-https
      - ca-certificates
      - curl
      - avahi-daemon
      - avahi-utils
      - libnss-mdns  # Enables mDNS resolution
      - software-properties-common
    runcmd:
      - systemctl enable avahi-daemon
      - systemctl start avahi-daemon
      - sed -i 's/^hosts:.*$/hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4/' /etc/nsswitch.conf
    EOF
  }
}

resource "null_resource" "setup_bridge_module" {
  provisioner "local-exec" {
    command = "bash ../scripts/ensure_bridge_module.sh"
  }

  triggers = {
    always_run = "${timestamp()}"
  }
  depends_on = [lxd_instance.container]
}

resource "null_resource" "cleanup_bridge_module" {
  provisioner "local-exec" {
    when    = destroy
    command = "bash ../scripts/cleanup_bridge_module.sh"
  }
}

resource "null_resource" "wait_for_ssh" {

  depends_on = [lxd_instance.container]

  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = var.ssh_username
      private_key = file(var.ssh_private_key_path)
      host        = lxd_instance.container.ipv4_address
    }

    inline = [
      "echo 'SSH is ready'"
    ]
  }
}

resource "null_resource" "provision_scripts" {

  
  depends_on = [
    lxd_instance.container,
    null_resource.wait_for_ssh
  ]

  connection {
    type        = "ssh"
    user        = var.ssh_username
    private_key = file(var.ssh_private_key_path)
    host        = lxd_instance.container.ipv4_address
  }

  # Copy scripts
  provisioner "file" {
    source      = "../scripts/install_docker.sh"
    destination = "/home/${var.ssh_username}/install_docker.sh"
  }

  provisioner "file" {
    source      = "../scripts/startup-script.sh"
    destination = "/home/${var.ssh_username}/startup-script.sh"
  }

  provisioner "file" {
    source      = "../scripts/startup-script.service"
    destination = "/home/${var.ssh_username}/startup-script.service"
  }

  provisioner "file" {
    source      = "../scripts/watch-runners.sh"
    destination = "/home/${var.ssh_username}/watch-runners.sh"
  }

  provisioner "file" {
    source      = "../scripts/actions.runners.service"
    destination = "/home/${var.ssh_username}/actions.runners.service"
  }

  provisioner "file" {
    source      = "../scripts/setup_github_actions.sh"
    destination = "/home/${var.ssh_username}/setup_github_actions.sh"
  }

  # Run commands via remote-exec
  provisioner "remote-exec" {
    inline = [
      "export DOCKER_HUB_USERNAME='${var.docker_hub_username}'",
      "export DOCKER_HUB_TOKEN='${var.docker_hub_token}'",

      "sudo DEBIAN_FRONTEND=noninteractive apt-get update -y",
      "sudo apt-get install -y fail2ban ufw inotify-tools",

      # UFW rules
      "sudo ufw default deny incoming",
      "sudo ufw default allow outgoing",
      "sudo ufw allow ssh",
      "sudo ufw allow 80/tcp",
      "sudo ufw allow 443/tcp",
      "echo 'y' | sudo ufw enable",

      # Enable and start fail2ban
      "sudo systemctl enable fail2ban",
      "sudo systemctl start fail2ban",

      # Run install_docker.sh
      "chmod +x /home/${var.ssh_username}/install_docker.sh",
      "/home/${var.ssh_username}/install_docker.sh",

      # Create directories
      "mkdir -p /home/${var.ssh_username}/action-runners/backend",
      "mkdir -p /home/${var.ssh_username}/action-runners/frontend",
      # "mkdir -p /home/${var.ssh_username}/action-runners/duckdns",
      "mkdir -p /home/${var.ssh_username}/action-runners/logs",

      "chown -R ${var.ssh_username}:${var.ssh_username} /home/${var.ssh_username}/action-runners",
      "chmod +x /home/${var.ssh_username}/watch-runners.sh",
      "chmod +x /home/${var.ssh_username}/setup_github_actions.sh",

      # Move service files
      "sudo mv /home/${var.ssh_username}/startup-script.service /etc/systemd/system/startup-script.service",
      "sudo mv /home/${var.ssh_username}/actions.runners.service /etc/systemd/system/actions.runners.service",

      # Move watch-runners.sh
      "mv /home/${var.ssh_username}/watch-runners.sh /home/${var.ssh_username}/action-runners/watch-runners.sh",
      "chown ${var.ssh_username}:${var.ssh_username} /home/${var.ssh_username}/action-runners/watch-runners.sh",

      # Enable and start services
      "sudo systemctl daemon-reload",
      "sudo systemctl enable startup-script.service",
      "sudo systemctl start startup-script.service",
      "sudo systemctl enable actions.runners.service",
      "sudo systemctl start actions.runners.service"
    ]
  }
}

# deploy/lxd/main.tf