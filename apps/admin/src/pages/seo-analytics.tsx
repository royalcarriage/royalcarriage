import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';

interface AnalyticsMetrics {
  totalLocations: number;
  totalServices: number;
  totalVehicles: number;
  contentGenerated: number;
  contentPending: number;
  contentApproved: number;
  contentRejected: number;
  pagesGenerated: number;
  pagesPublished: number;
  estimatedTotalPages: number;
  coveragePercentage: number;
}

interface WebsiteStats {
  websiteId: string;
  name: string;
  contentCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  pagesGenerated: number;
  locationsCovered: number;
}

interface LocationProgress {
  locationId: string;
  locationName: string;
  region: string;
  totalServiceCombos: number;
  contentGenerated: number;
  contentApproved: number;
  progress: number;
}

export default function SeoAnalyticsPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalLocations: 0,
    totalServices: 0,
    totalVehicles: 0,
    contentGenerated: 0,
    contentPending: 0,
    contentApproved: 0,
    contentRejected: 0,
    pagesGenerated: 0,
    pagesPublished: 0,
    estimatedTotalPages: 0,
    coveragePercentage: 0,
  });
  const [websiteStats, setWebsiteStats] = useState<WebsiteStats[]>([]);
  const [locationProgress, setLocationProgress] = useState<LocationProgress[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadAnalytics();
  }, [role]);

  async function loadAnalytics() {
    try {
      setLoading(true);

      // Load locations count
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const totalLocations = locationsSnapshot.size;

      // Load services count
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const totalServices = servicesSnapshot.size;

      // Load fleet count
      const fleetSnapshot = await getDocs(collection(db, 'fleet_vehicles'));
      const totalVehicles = fleetSnapshot.size;

      // Load content stats
      const contentSnapshot = await getDocs(collection(db, 'service_content'));
      const contentGenerated = contentSnapshot.size;
      let contentApproved = 0;
      let contentPending = 0;
      let contentRejected = 0;

      contentSnapshot.docs.forEach((doc) => {
        const status = doc.data().approvalStatus;
        if (status === 'approved') contentApproved++;
        else if (status === 'pending') contentPending++;
        else if (status === 'rejected') contentRejected++;
      });

      // Load page generation stats
      const pagesSnapshot = await getDocs(collection(db, 'generated_pages'));
      const pagesGenerated = pagesSnapshot.size;
      let pagesPublished = 0;

      pagesSnapshot.docs.forEach((doc) => {
        if (doc.data().status === 'published') pagesPublished++;
      });

      // Calculate estimated total pages (25 locations × 80 services × 4 websites)
      const estimatedTotalPages = totalLocations * totalServices;

      // Calculate coverage percentage
      const coveragePercentage = estimatedTotalPages > 0
        ? Math.round((contentApproved / estimatedTotalPages) * 100)
        : 0;

      setMetrics({
        totalLocations,
        totalServices,
        totalVehicles,
        contentGenerated,
        contentPending,
        contentApproved,
        contentRejected,
        pagesGenerated,
        pagesPublished,
        estimatedTotalPages,
        coveragePercentage,
      });

      // Load website stats
      const websites = ['airport', 'corporate', 'wedding', 'partyBus'];
      const stats: WebsiteStats[] = [];

      for (const websiteId of websites) {
        const q = query(collection(db, 'service_content'), where('websiteId', '==', websiteId));
        const snapshot = await getDocs(q);

        let approved = 0, pending = 0, rejected = 0;
        snapshot.docs.forEach((doc) => {
          const status = doc.data().approvalStatus;
          if (status === 'approved') approved++;
          else if (status === 'pending') pending++;
          else if (status === 'rejected') rejected++;
        });

        const uniqueLocations = new Set(snapshot.docs.map((doc) => doc.data().locationId)).size;

        stats.push({
          websiteId,
          name: websiteId.charAt(0).toUpperCase() + websiteId.slice(1),
          contentCount: snapshot.size,
          approvedCount: approved,
          pendingCount: pending,
          rejectedCount: rejected,
          pagesGenerated: Math.round(approved * 0.8), // Estimate: 80% of approved content becomes pages
          locationsCovered: uniqueLocations,
        });
      }

      setWebsiteStats(stats);

      // Load location progress
      const locProgress: LocationProgress[] = [];
      for (const locDoc of locationsSnapshot.docs) {
        const location = locDoc.data();
        const q = query(collection(db, 'service_content'), where('locationId', '==', locDoc.id));
        const contentDocs = await getDocs(q);

        let approved = 0;
        contentDocs.docs.forEach((doc) => {
          if (doc.data().approvalStatus === 'approved') approved++;
        });

        const totalServiceCombos = (location.applicableServices.airport || 0) +
                                 (location.applicableServices.corporate || 0) +
                                 (location.applicableServices.wedding || 0) +
                                 (location.applicableServices.partyBus || 0);

        locProgress.push({
          locationId: locDoc.id,
          locationName: location.name,
          region: location.region,
          totalServiceCombos,
          contentGenerated: contentDocs.size,
          contentApproved: approved,
          progress: totalServiceCombos > 0 ? Math.round((approved / totalServiceCombos) * 100) : 0,
        });
      }

      locProgress.sort((a, b) => b.progress - a.progress);
      setLocationProgress(locProgress);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  const filteredWebsiteStats = selectedWebsite === 'all'
    ? websiteStats
    : websiteStats.filter((w) => w.websiteId === selectedWebsite);

  return (
    <div className="p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">SEO Analytics Dashboard</h1>
          <p className="text-gray-600">
            Track content generation progress and SEO coverage across all 240+ locations
          </p>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{metrics.estimatedTotalPages.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Possible Pages</div>
            <div className="text-xs text-gray-500 mt-1">{metrics.totalLocations} locations × {metrics.totalServices} services</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{metrics.contentApproved.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Approved Content</div>
            <div className="text-xs text-gray-500 mt-1">{metrics.coveragePercentage}% coverage</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{metrics.contentPending}</div>
            <div className="text-sm text-gray-600">Pending Approval</div>
            <div className="text-xs text-gray-500 mt-1">{metrics.contentGenerated} total generated</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{metrics.pagesPublished}</div>
            <div className="text-sm text-gray-600">Published Pages</div>
            <div className="text-xs text-gray-500 mt-1">{metrics.pagesGenerated} generated</div>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Overall SEO Coverage</h3>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full flex items-center justify-center text-white font-bold text-sm transition-all"
              style={{ width: `${metrics.coveragePercentage}%` }}
            >
              {metrics.coveragePercentage > 10 && `${metrics.coveragePercentage}%`}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {metrics.contentApproved} of {metrics.estimatedTotalPages} pages approved for publishing
          </div>
        </div>

        {/* Website Performance */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Website Performance</h2>
          <div className="grid grid-cols-1 gap-4">
            {websiteStats.map((site) => (
              <div key={site.websiteId} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{site.name} Website</h4>
                    <p className="text-sm text-gray-600">Coverage: {site.locationsCovered} locations</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{site.approvedCount}</div>
                    <div className="text-xs text-gray-500">approved content</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-semibold text-blue-700">{site.contentCount}</div>
                    <div className="text-gray-600">Generated</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-semibold text-green-700">{site.approvedCount}</div>
                    <div className="text-gray-600">Approved</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <div className="font-semibold text-yellow-700">{site.pendingCount}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="font-semibold text-red-700">{site.rejectedCount}</div>
                    <div className="text-gray-600">Rejected</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all"
                    style={{
                      width: `${site.contentCount > 0 ? (site.approvedCount / site.contentCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Progress */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Location Progress (Top 15)</h2>
          <div className="space-y-3">
            {locationProgress.slice(0, 15).map((loc) => (
              <div key={loc.locationId} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{loc.locationName}</h4>
                    <p className="text-xs text-gray-500 capitalize">{loc.region.replace('-', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{loc.progress}%</div>
                    <div className="text-xs text-gray-500">
                      {loc.contentApproved} of {loc.totalServiceCombos}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      loc.progress === 100 ? 'bg-green-600' : loc.progress >= 50 ? 'bg-blue-600' : 'bg-yellow-600'
                    }`}
                    style={{ width: `${loc.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 border rounded-lg p-6">
            <h3 className="font-bold mb-3">Data Foundation</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Locations</span>
                <span className="font-semibold">{metrics.totalLocations}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Services</span>
                <span className="font-semibold">{metrics.totalServices}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Fleet Vehicles</span>
                <span className="font-semibold">{metrics.totalVehicles}</span>
              </li>
              <li className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-semibold">Possible Combinations</span>
                <span className="font-bold">{metrics.estimatedTotalPages.toLocaleString()}</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border rounded-lg p-6">
            <h3 className="font-bold mb-3">Content Pipeline</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Generated</span>
                <span className="font-semibold">{metrics.contentGenerated}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Approved</span>
                <span className="font-semibold text-green-600">{metrics.contentApproved}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{metrics.contentPending}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">{metrics.contentRejected}</span>
              </li>
            </ul>
          </div>
        </div>

        {loading && <div className="text-center py-8 text-gray-500">Loading analytics...</div>}
      </div>
    </div>
  );
}
