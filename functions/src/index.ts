import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { requireRole } from "./auth";
import { importMoovsCsv } from "./parsers/moovs";
import { importGoogleAdsCsv } from "./parsers/googleAds";
import { computeRollups } from "./metrics/compute";
import { proposeTopics } from "./seo/propose";
import { runQualityGate } from "./seo/gate";
import { publishApproved } from "./seo/publish";

initializeApp();
const db = getFirestore();

// Callable: Import Moovs CSV
export const importMoovsCSV = onCall({ cors: true, timeoutSeconds: 540 }, async (req) => {
  await requireRole(req, ["Editor", "Admin", "SuperAdmin"]);
  const { org, rawCsvText } = req.data || {};
  if (!org || typeof org !== "string") throw new HttpsError("invalid-argument", "Missing org");
  if (!rawCsvText || typeof rawCsvText !== "string") throw new HttpsError("invalid-argument", "Missing rawCsvText");
  const result = await importMoovsCsv(db, { org, rawCsvText });
  return { ok: true, ...result };
});

// Callable: Import Google Ads CSV
export const importAdsCSV = onCall({ cors: true, timeoutSeconds: 540 }, async (req) => {
  await requireRole(req, ["Editor", "Admin", "SuperAdmin"]);
  const { org, datasetName, rawCsvText } = req.data || {};
  if (!org) throw new HttpsError("invalid-argument", "Missing org");
  if (!datasetName) throw new HttpsError("invalid-argument", "Missing datasetName");
  if (!rawCsvText) throw new HttpsError("invalid-argument", "Missing rawCsvText");
  const result = await importGoogleAdsCsv(db, { org, datasetName, rawCsvText });
  return { ok: true, ...result };
});

// Callable: Compute metrics rollups
export const computeMetrics = onCall({ cors: true, timeoutSeconds: 540 }, async (req) => {
  await requireRole(req, ["Admin", "SuperAdmin"]);
  const { org, startDate, endDate } = req.data || {};
  if (!org) throw new HttpsError("invalid-argument", "Missing org");
  const result = await computeRollups(db, { org, startDate, endDate });
  return { ok: true, ...result };
});

// Callable: SEO propose topics
export const seoPropose = onCall({ cors: true, timeoutSeconds: 540 }, async (req) => {
  await requireRole(req, ["Editor", "Admin", "SuperAdmin"]);
  const { org, limit = 25 } = req.data || {};
  if (!org) throw new HttpsError("invalid-argument", "Missing org");
  const result = await proposeTopics(db, { org, limit });
  return { ok: true, ...result };
});

// Callable: Run SEO quality gate
export const seoGate = onCall({ cors: true, timeoutSeconds: 540 }, async (req) => {
  await requireRole(req, ["Admin", "SuperAdmin"]);
  const { org } = req.data || {};
  if (!org) throw new HttpsError("invalid-argument", "Missing org");
  const result = await runQualityGate(db, { org });
  return { ok: true, ...result };
});

// Callable: Publish SEO content (SuperAdmin only)
export const seoPublish = onCall({ cors: true, timeoutSeconds: 540 }, async (req) => {
  await requireRole(req, ["SuperAdmin"]);
  const { org, publishLimit = 10 } = req.data || {};
  if (!org) throw new HttpsError("invalid-argument", "Missing org");
  const result = await publishApproved(db, { org, publishLimit });
  return { ok: true, ...result };
});

// Scheduled: nightly metrics refresh
export const nightlyMetrics = onSchedule("every day 03:10", async () => {
  const org = "royalcarriagelimo";
  await computeRollups(db, { org });
});

// Scheduled: biweekly SEO propose + gate (NO auto-publish)
export const biweeklySeoPropose = onSchedule("every 14 days 04:20", async () => {
  const org = "royalcarriagelimo";
  await proposeTopics(db, { org, limit: 25 });
  await runQualityGate(db, { org });
});
