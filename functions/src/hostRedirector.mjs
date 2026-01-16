// Simple host-aware redirect Cloud Function
import {https} from 'firebase-functions';

export const hostRedirector = https.onRequest((req, res) => {
  const host = req.get('host') || '';
  const xfh = req.get('x-forwarded-host') || '';
  const normalizedHost = (xfh || host).toLowerCase();
  const defaultHosts = new Set([
    'royalcarriagelimoseo.web.app',
    'royalcarriagelimoseo.firebaseapp.com'
  ]);
  // Only redirect if the incoming host is one of the default hosts
  if (defaultHosts.has(normalizedHost)) {
    const target = 'https://admin.royalcarriagelimo.com' + (req.originalUrl || req.url || '/');
    res.set('Cache-Control', 'no-cache');
    return res.redirect(301, target);
  }
  // Otherwise, serve the hosting content by returning 404 so Hosting can continue to serve
  res.status(404).send('Not handled by redirector');
});
