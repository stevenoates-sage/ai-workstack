# 1. Tell Terraform we are using AWS
provider "aws" {
  region = "us-east-1"
}

# 2. Define the Table
resource "aws_dynamodb_table" "sigma_workstack" {
  name           = "sigma-workstack-requests"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  # These are the columns we will sort by
  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "Status"
    type = "S"
  }

  attribute {
    name = "Team"
    type = "S"
  }

  # Index 1: For your Kanban Board (Group by Status)
  global_secondary_index {
    name               = "GSI_Status"
    hash_key           = "Status"
    projection_type    = "ALL"
  }

  # Index 2: For your Roadmap (Group by Team)
  global_secondary_index {
    name               = "GSI_Team"
    hash_key           = "Team"
    projection_type    = "ALL"
  }

  tags = {
    Project = "SIGMA"
  }
}