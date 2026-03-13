terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ──────────────────────────────────────────────────────────────────────────────
# DynamoDB — ticket storage
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_dynamodb_table" "tickets" {
  name         = "ai-workstack-tickets"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Project = "ai-workstack"
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# Cognito — username / password auth (admin-created accounts only)
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_cognito_user_pool" "main" {
  name = "ai-workstack-users"

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  tags = {
    Project = "ai-workstack"
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "ai-workstack-web"
  user_pool_id = aws_cognito_user_pool.main.id

  # No client secret — this is a public browser app
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  access_token_validity  = 8
  id_token_validity      = 8
  refresh_token_validity = 30
}

# ──────────────────────────────────────────────────────────────────────────────
# Cognito Users
# ──────────────────────────────────────────────────────────────────────────────
locals {
  users = {
    "steve.oates@sage.com" = {
      name = "Steve Oates"
    }
    "rory.howells@sage.com" = {
      name = "Rory Howells"
    }
    "dav.bhamra@sage.com" = {
      name = "Dav Bhamra"
    }
    "dominic.ballinger@sage.com" = {
      name = "Dominic Ballinger"
    }
  }
}

resource "aws_cognito_user" "users" {
  for_each = local.users

  user_pool_id       = aws_cognito_user_pool.main.id
  username           = each.key
  temporary_password = var.initial_password
  message_action     = "SUPPRESS"

  attributes = {
    name           = each.value.name
    email          = each.key
    email_verified = "true"
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# Amplify — hosting, connected to GitHub master branch
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_amplify_app" "main" {
  name         = "ai-workstack"
  repository   = "https://github.com/stevenoates-sage/ai-workstack"
  access_token = var.github_token

  # Vite build spec — dist/ is the output directory
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
  EOT

  # These become VITE_* env vars available at build time
  environment_variables = {
    VITE_COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
    VITE_COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.web.id
    VITE_AWS_REGION           = var.aws_region
    VITE_DYNAMO_TABLE         = aws_dynamodb_table.tickets.name
  }

  tags = {
    Project = "ai-workstack"
  }
}

resource "aws_amplify_branch" "master" {
  app_id      = aws_amplify_app.main.id
  branch_name = "master"

  # Auto-build whenever master is pushed to
  enable_auto_build = true

  tags = {
    Project = "ai-workstack"
  }
}
