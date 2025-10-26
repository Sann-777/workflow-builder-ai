terraform {
  required_version = ">= 1.0"
  
  # Remote state backend - uses S3 bucket created by backend-setup
  backend "s3" {
    bucket         = "workflow-builder-terraform-state"
    key            = "workflow-builder/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "workflow-builder-terraform-locks"
    encrypt        = true
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
