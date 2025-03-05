
variable "regular_vm_user_username" {
  description = "The less privileged user name to use for the VM instance"
  type        = string
}



variable "instance_name" {
  description = "The name of the DigitalOcean Droplet (VM)."
  type        = string
}

variable "instance_hostname" {
  description = "The instance hostname for mDNS."
  type        = string
}
variable "ssh_username" {
  description = "The username for SSH connections."
  type        = string
}



variable "regular_vm_user_password" {
  description = "The less privileged user password to use for the VM instance"
  type        = string
}
variable "ssh_public_key_fingerprint" {
  description = "The fingerprint of the SSH public key to use for the Droplet."
  type        = string
}

variable "ssh_private_key_path" {
  description = "The path to the private SSH key for connecting to the Droplet."
  type        = string
}

variable "ssh_public_key_path" {
  description = "The path to the public SSH key for connecting to the Droplet."
  type        = string
}

variable "machine_type" {
  description = "The size of the DigitalOcean Droplet (e.g., s-1vcpu-1gb)."
  type        = string
}

variable "os_image" {
  description = "The image of the DigitalOcean Droplet (e.g., s-1vcpu-1gb)."
  type        = string
  default     = "ubuntu:22.04"
}

variable "docker_hub_username" {
  description = "Docker Hub username for pulling images."
  type        = string
}

variable "docker_hub_token" {
  description = "Docker Hub token for authentication."
  type        = string
}
variable "vpc_name" {
  description = "The name of the VPC to create."
  type        = string
  default     = "media-app-vpc"
}
variable "environment" {
  description = "The deployment environment."
  type        = string
  default     = "staging"
}

variable "use_mdns" {
  default     = true
  description = "Set to true to use mDNS (.local), or false to use IP address"
}





variable "network_bridge" {
  description = "LXD network bridge"
  type        = string
}

variable "storage_pool" {
  description = "Storage pool for LXD"
  type        = string
}
# terraform_do/variables.tf
