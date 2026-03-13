variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for all resources"
}

variable "github_token" {
  type        = string
  sensitive   = true
  description = <<-EOT
    GitHub Personal Access Token (classic) with 'repo' scope.
    Create at: https://github.com/settings/tokens
    Store in terraform/terraform.tfvars — this file is gitignored.
  EOT
}

variable "initial_password" {
  type        = string
  sensitive   = true
  default     = "Welcome1!"
  description = <<-EOT
    Temporary password for all initial Cognito users.
    Users must change it on first login.
    Must satisfy: 8+ chars, 1 uppercase, 1 lowercase, 1 number.
    Override in terraform.tfvars if you want something different.
  EOT
}
