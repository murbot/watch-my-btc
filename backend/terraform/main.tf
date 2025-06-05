provider "aws" {
  region     = var.region
  #  profile = var.profile
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.46.0"
    }
  }
  required_version = ">= 1.12.0"
}
