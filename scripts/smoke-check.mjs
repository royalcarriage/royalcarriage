/**
 * Simple smoke check for preview/prod hosting.
 * Usage:
 *   node scripts/smoke-check.mjs
 *   PREVIEW_URL=https://... node scripts/smoke-check.mjs
 */
import https from "https";

const PREVIEW_URL = process.env.PREVIEW_URL || "https://royalcarriagelimoseo--canary-1768485534-berzffmk.web.app";
const PROD_URL = process.env.PROD_URL || "https://royalcarriagelimoseo.web.app";

async function head(url) {
  return new Promise((resolve, reject) => {
    https
      .request(url, { method: "HEAD" }, res => {
        resolve({ url, status: res.statusCode });
      })
      .on("error", reject)
      .end();
  });
}

async function get(url) {
  return new Promise((resolve, reject) => {
    let body = "";
    https
      .get(url, res => {
        res.on("data", chunk => (body += chunk.toString()));
        res.on("end", () => resolve({ url, status: res.statusCode, body: body.slice(0, 2000) }));
      })
      .on("error", reject);
  });
}

async function run() {
  const targets = [
    `${PREVIEW_URL}/`,
    `${PREVIEW_URL}/admin`,
    `${PROD_URL}/`,
  ];

  for (const url of targets) {
    try {
      const res = await head(url);
      console.log(`HEAD ${url} -> ${res.status}`);
      if (res.status >= 400 || res.status === undefined) {
        console.log(`Attempting GET for ${url}`);
        const g = await get(url);
        console.log(`GET ${url} -> ${g.status} (body len ${g.body.length})`);
      }
    } catch (err) {
      console.error(`Error for ${url}:`, err.message);
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
