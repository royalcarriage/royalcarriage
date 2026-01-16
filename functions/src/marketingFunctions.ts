import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

const verifyAuth = (context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');
};

// --- CAMPAIGNS ---

export const createCampaign = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const ref = await db.collection("campaigns").add({
        ...data,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id };
});

export const getCampaignPerformance = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    // Mock analytics
    return { clicks: 1200, conversions: 45, spend: 500 };
});

export const pauseCampaign = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("campaigns").doc(data.campaignId).update({ status: "paused" });
    return { success: true };
});

// --- SEO MANAGEMENT ---

export const updateMetaTags = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { pageId, title, description } = data;
    await db.collection("pages").doc(pageId).update({
        metaTitle: title,
        metaDescription: description,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const getSEOHealth = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const analyses = await db.collection("page_analyses")
        .orderBy("analyzedAt", "desc")
        .limit(10)
        .get();
    return analyses.docs.map(d => d.data());
});

// --- CONTENT MARKETING ---

export const publishBlogPost = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { title, content, tags } = data;
    await db.collection("posts").add({
        title, content, tags,
        status: "published",
        publishedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const scheduleSocialPost = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { platform, content, time } = data;
    await db.collection("social_queue").add({
        platform, content, scheduledTime: time,
        status: "scheduled"
    });
    return { success: true };
});

export const getAudienceInsights = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    // Mock data based on customer aggregate
    return { topLocations: ["Chicago", "Naperville"], topIndustries: ["Finance", "Tech"] };
});

export const trackConversion = functions.https.onCall(async (data, context) => {
    // Public endpoint for pixel tracking
    await db.collection("conversions").add({
        source: data.source,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const generateSitemap = functions.https.onRequest(async (req, res) => {
    // Generate XML sitemap
    res.set('Content-Type', 'text/xml');
    res.send('<urlset><url><loc>https://royalcarriagelimoseo.web.app/</loc></url></urlset>');
});
