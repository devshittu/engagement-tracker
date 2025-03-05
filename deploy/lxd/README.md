before you run any apply ensure you run this as the key is the first thing the agent needs to run before all the needed proxy jump can be provided.

```sh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/local-staging-ed25519

```

Add a specific resource on the gcp

```sh

terraform init

terraform apply -var-file="terraform.staging.tfvars" --auto-approve


terraform destroy -var-file="terraform.staging.tfvars" --auto-approve

terraform destroy -var-file="terraform.staging.tfvars" -target=digitalocean_droplet.media_app_instance --auto-approve


terraform apply -var-file="terraform.staging.tfvars" -target=digitalocean_droplet.media_app_instance --auto-approve
```

```sh
ssh -i ~/.ssh/id_ed_devshittu mediavmuser@10.39.238.230

```
