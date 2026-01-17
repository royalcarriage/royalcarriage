### Request: Org Policy / IAM update to allow public invoker for `api` Cloud Function

Project: royalcarriagelimoseo
Region: us-central1
Function: `api` (Cloud Function HTTP endpoint)

Issue:
- Current organization policy prevents granting the `allUsers` member the `roles/cloudfunctions.invoker` role. This blocks public/anonymous HTTP access to our `api` endpoint and returns 403 errors for unauthenticated requests.

Desired change:
- Allow `allUsers` (or provide a controlled exception) to be granted `roles/cloudfunctions.invoker` on the `api` function, or advise acceptable org-policy alternative to allow public access.

Example IAM command to apply after policy change:
```
gcloud functions add-iam-policy-binding api \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=royalcarriagelimoseo
```

If org policy cannot be changed, recommended alternatives:
- Use a dedicated service account for health checks and grant it `roles/cloudfunctions.invoker` (we created `health-checker` SA for this purpose).
- Use an API Gateway or Cloud Endpoints to manage public access while keeping function-level IAM restricted.

Provide the project number and any required logs or timestamps and we can supply them for support.
