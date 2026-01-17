### Quota Increase Request — Royal Carriage

Project: royalcarriagelimoseo
Date: (fill in)

Requested by: (name, email)

Summary:
- We deployed a large set of Cloud Functions and hit quota / IAM policy limits during mass updates. We request quota increases and guidance to avoid update failures when deploying many functions at once.

APIs / Quotas to increase (recommended):
- Cloud Functions API: increase operations / minute / per-minute update rate (if available).
- Cloud Build: increase concurrent builds and build minutes (for artifact uploads and builds triggered during function deploys).
- IAM: increase rate limits for setting IAM policies (or confirm service account permissions to allow IAM update in bulk).
- Artifact Registry / Storage: increase upload/concurrency quotas if many artifacts are uploaded simultaneously.

Suggested quota values (example):
- Cloud Functions operations/minute: 600 -> 1200
- Cloud Build concurrent builds: 10 -> 50
- IAM policy write rate: request guidance (these are often handled by support)

Required details for the GCP Support form:
- Project ID: royalcarriagelimoseo
- Project number: (find in GCP Console)
- Region(s): us-central1
- APIs in use: Cloud Functions, Cloud Build, Artifact Registry, IAM
- Reason: Production deployment of ~120 Cloud Functions in one release; mass updates triggered by CI/CD; we observed "Quota Exceeded" and "Failed to set the IAM Policy" errors during deploy.
- Desired timeline: ASAP (business-critical deployment)

Example support message:
```
Hello GCP Support,

We are deploying a large set of Cloud Functions for project `royalcarriagelimoseo` in `us-central1`. During our deploy we received repeated "Quota Exceeded" errors for function updates and several "Failed to set the IAM Policy" errors. Our CI/CD deploys ~120 functions in a single release which triggers many Cloud Build and IAM operations concurrently.

Could you please advise and approve quota increases for Cloud Functions update rate, Cloud Build concurrent builds, and any IAM write-rate limits required to avoid update failures? Project ID: royalcarriagelimoseo.

If you need more details (project number, timeline, or logs), we can provide them.

Thanks,
(Your name)
```

Links:
- GCP Quotas: https://console.cloud.google.com/iam-admin/quotas
- Support: https://cloud.google.com/support/docs

Next steps:
1. Open a support ticket in the GCP Console quoting the above details.
2. Consider deploying functions in staggered batches (script `scripts/deploy-functions-batches.sh`).
