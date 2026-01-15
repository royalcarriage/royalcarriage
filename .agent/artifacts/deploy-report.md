# Deploy Report (2026-01-15)

- Firebase dry-run: `firebase deploy --only firestore:rules,storage --dry-run` ✅.
- Preview deploy: `firebase hosting:channel:deploy canary-1768485534 --expires 1d` ✅ URL: https://royalcarriagelimoseo--canary-1768485534-berzffmk.web.app.
- Production deploy: `firebase deploy --only hosting,firestore:rules,storage` ✅ (hosting + rules).
- Functions deploy: `firebase deploy --only functions` ✅ after fixing predeploy; functions live (dailyPageAnalysis/weeklySeoReport/triggerPageAnalysis/generateContent/generateImage/autoAnalyzeNewPage).
- Note: Functions deploy emitted deprecation notice for `functions.config()`; migrate to `params` before March 2026.

Pending:
- Add automated smoke checks against preview/prod (home/admin/auth/flows).
- Monitor functions logs post-deploy.
