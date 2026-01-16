import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: 'airport' | 'corporate' | 'wedding' | 'partyBus';
  locationCount: number;
  vehicleCount: number;
  contentGenerated: number;
  contentTotal: number;
  status: 'active' | 'inactive' | 'draft';
  features: string[];
  basePrice?: number;
  lastUpdated?: string;
}

const WEBSITE_TABS = [
  { id: 'all', label: 'All Services', color: 'gray' },
  { id: 'airport', label: 'Airport', color: 'blue' },
  { id: 'corporate', label: 'Corporate', color: 'purple' },
  { id: 'wedding', label: 'Wedding', color: 'pink' },
  { id: 'partyBus', label: 'Party Bus', color: 'orange' },
] as const;

export default function ServicesManagementPage() {
  const { user, role } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [generatingContent, setGeneratingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadServices();
  }, [role]);

  async function loadServices() {
    try {
      setLoading(true);
      const q = query(collection(db, 'services'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceItem[];

      items.sort((a, b) => {
        const websiteCompare = a.website.localeCompare(b.website);
        if (websiteCompare !== 0) return websiteCompare;
        return a.name.localeCompare(b.name);
      });

      setServices(items);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = services.filter((service) => {
    const matchesWebsite = selectedWebsite === 'all' || service.website === selectedWebsite;
    const matchesSearch = searchQuery === '' ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWebsite && matchesSearch;
  });

  async function handleGenerateContent() {
    if (selectedServices.size === 0) {
      alert('Please select at least one service');
      return;
    }

    setGeneratingContent(true);

    try {
      const servicesArray = Array.from(selectedServices);

      const response = await fetch('/.netlify/functions/generate-service-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceIds: servicesArray,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      alert(`Successfully generated ${result.generated} content items`);
      setGeneratingContent(false);
      setSelectedServices(new Set());
      loadServices();
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Check console for details.');
      setGeneratingContent(false);
    }
  }

  function toggleServiceSelection(serviceId: string) {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  }

  function toggleSelectAll() {
    if (selectedServices.size === filteredServices.length) {
      setSelectedServices(new Set());
    } else {
      setSelectedServices(new Set(filteredServices.map((s) => s.id)));
    }
  }

  function getWebsiteColor(website: string) {
    const tab = WEBSITE_TABS.find((t) => t.id === website);
    return tab?.color || 'gray';
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Service Management</h1>
          <p className="text-gray-600">
            Manage 91 services across 4 websites and generate AI content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{services.length}</div>
            <div className="text-gray-600">Total Services</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{selectedServices.size}</div>
            <div className="text-gray-600">Selected</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {services.reduce((sum, s) => sum + s.locationCount, 0)}
            </div>
            <div className="text-gray-600">Total Locations</div>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {services.reduce((sum, s) => sum + s.contentGenerated, 0)} / {services.reduce((sum, s) => sum + s.contentTotal, 0)}
            </div>
            <div className="text-gray-600">Content Generated</div>
          </div>
        </div>

        {/* Website Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            {WEBSITE_TABS.map((tab) => {
              const count = tab.id === 'all'
                ? services.length
                : services.filter((s) => s.website === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedWebsite(tab.id)}
                  className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                    selectedWebsite === tab.id
                      ? `border-${tab.color}-600 text-${tab.color}-600`
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerateContent}
            disabled={generatingContent || selectedServices.size === 0}
            className={`px-6 py-2 rounded-lg font-bold text-white transition ${
              generatingContent || selectedServices.size === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {generatingContent ? 'Generating...' : `Generate Content (${selectedServices.size})`}
          </button>
        </div>

        {/* Services Table */}
        {loading ? (
          <div className="text-center py-12">Loading services...</div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedServices.size === filteredServices.length && filteredServices.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => {
                  const progress = service.contentTotal > 0
                    ? Math.round((service.contentGenerated / service.contentTotal) * 100)
                    : 0;
                  const color = getWebsiteColor(service.website);

                  return (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedServices.has(service.id)}
                          onChange={() => toggleServiceSelection(service.id)}
                          className="w-5 h-5"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.description.substring(0, 60)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800 capitalize`}>
                          {service.website}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.locationCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.vehicleCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div
                              className={`bg-${color}-600 h-2 rounded-full transition-all`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {service.contentGenerated}/{service.contentTotal}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : service.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Generate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredServices.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No services found matching your criteria
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
