variable "region" {
  description = "AWS region"
  default     = "us-west-2"
}

variable "aws_access_key" {
  type        = string
  description = "AWS Access Key"
}

variable "aws_secret_key" {
  type        = string
  description = "AWS Secret Key"
}

variable "aws_region" {
  type        = string
  description = "AWS Region"
}

variable "prefix" {
  description = "A prefix for all resources"
}

variable "tags" {
  description = "Common tags for all resources"
  default     = {
    ManagedBy = "terraform"
  }
}

variable "contact_us_recipient_email" {
  description = "Email address to send contact us form submissions to"
}

variable "from_email" {
  description = "Email address to send automated emails from"
}
