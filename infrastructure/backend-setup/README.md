# Terraform Backend Setup

This directory contains the Terraform configuration for creating the S3 bucket and DynamoDB table used for storing Terraform state.

## ⚠️ Important

**This setup should only be run ONCE** when initially setting up the infrastructure. It should NOT be run on every deployment.

## Resources Created

- **S3 Bucket**: `workflow-builder-terraform-state` - Stores Terraform state files
- **DynamoDB Table**: `workflow-builder-terraform-locks` - Provides state locking

## Initial Setup (Run Once)

If these resources don't exist yet, run:

```bash
cd infrastructure/backend-setup
terraform init
terraform apply
```

## Verification

Check if the resources already exist:

```bash
# Check S3 bucket
aws s3 ls | grep workflow-builder-terraform-state

# Check DynamoDB table
aws dynamodb list-tables | grep workflow-builder-terraform-locks
```

## Notes

- The S3 bucket has versioning enabled for state history
- The bucket is encrypted with AES256
- Public access is completely blocked
- The DynamoDB table uses on-demand billing
- These resources have `prevent_destroy = true` to avoid accidental deletion
