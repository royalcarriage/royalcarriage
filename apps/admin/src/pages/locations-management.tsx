import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';

interface LocationItem {
  id: string;
  name: string;
  state: string;
  type: 'neighborhood' | 'suburb';
  region: string;
  coordinates: { lat: number; lng: number };
  zipCodes: string[];
  population: number;
  description: string;
  applicableServices: {
    airport: number;
    corporate: number;
    wedding: number;
    partyBus: number;
  };
  contentGenerationStatus?: 'not-started' | 'in-progress' | 'completed' | 'pending-approval';
  servicesWithContent?: number;
  servicesTotal?: number;
}

const REGIONS = [
  'downtown',
  'north',
  'northeast',
  'west',
  'southwest',
  'south',
  'southeast',
  'western-suburbs',
  'northern-suburbs',
  'southern-suburbs',
];

const WEBSITES = ['airport', 'corporate', 'wedding', 'partyBus'] as const;

export default function LocationsManagementPage() {
  const { user, role } = useAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(new Set(['airport', 'corporate']));
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadLocations();
  }, [role]);

  async function loadLocations() {
    try {
      setLoading(true);
      const q = query(collection(db, 'locations'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LocationItem[];

      // Sort by region then name
      items.sort((a, b) => {
        const regionCompare = a.region.localeCompare(b.region);
        if (regionCompare !== 0) return regionCompare;
        return a.name.localeCompare(b.name);
      });

      setLocations(items);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLocations = locations.filter((loc) => {
    const matchesRegion = selectedRegion === 'all' || loc.region === selectedRegion;
    const matchesType = selectedType === 'all' || loc.type === selectedType;
    const matchesSearch = searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesType && matchesSearch;
  });

  async function handleGenerateContent() {
    if (selectedLocations.size === 0) {
      alert('Please select at least one location');
      return;
    }
    if (selectedWebsites.size === 0) {
      alert('Please select at least one website');
      return;
    }

    setGeneratingContent(true);
    setGenerationProgress({ current: 0, total: selectedLocations.size * selectedWebsites.size });

    try {
      const locationsArray = Array.from(selectedLocations);
      const websitesArray = Array.from(selectedWebsites);

      // Call Cloud Function to generate content
      const response = await fetch('/.netlify/functions/generate-batch-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationIds: locationsArray,
          serviceIds: [], // Will generate for all applicable services
          websiteIds: websitesArray,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      alert(`Successfully generated ${result.generated} content items`);
      setGeneratingContent(false);
      setSelectedLocations(new Set());
      loadLocations();
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Check console for details.');
      setGeneratingContent(false);
    }
  }

  function toggleLocationSelection(locationId: string) {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(locationId)) {
      newSelected.delete(locationId);
    } else {
      newSelected.add(locationId);
    }
    setSelectedLocations(newSelected);
  }

  function toggleWebsiteSelection(website: string) {
    const newSelected = new Set(selectedWebsites);
    if (newSelected.has(website)) {
      newSelected.delete(website);
    } else {
      newSelected.add(website);
    }
    setSelectedWebsites(newSelected);
  }

  function toggleSelectAll() {
    if (selectedLocations.size === filteredLocations.length) {
      setSelectedLocations(new Set());
    } else {
      setSelectedLocations(new Set(filteredLocations.map((loc) => loc.id)));
    }
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Location Management</h1>
          <p className="text-gray-600">
            Manage 240+ Chicago locations and generate AI content for services
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{locations.length}</div>
            <div className="text-gray-600">Total Locations</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{selectedLocations.size}</div>
            <div className="text-gray-600">Selected</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{selectedWebsites.size}</div>
            <div className="text-gray-600">Websites Selected</div>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {selectedLocations.size * selectedWebsites.size}
            </div>
            <div className="text-gray-600">Content Items to Generate</div>
          </div>
        </div>

        {/* Website Selection */}
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg mb-8">
          <h2 className="font-bold mb-4">Select Websites for Content Generation</h2>
          <div className="flex gap-4">
            {WEBSITES.map((website) => (
              <label key={website} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedWebsites.has(website)}
                  onChange={() => toggleWebsiteSelection(website)}
                  className="w-5 h-5"
                />
                <span className="capitalize">{website}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Filter by Region</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedRegion === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Regions ({locations.length})
            </button>
            {REGIONS.map((region) => {
              const count = locations.filter((loc) => loc.region === region).length;
              return count > 0 ? (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                    selectedRegion === region
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {region.replace('-', ' ')} ({count})
                </button>
              ) : null;
            })}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold mb-2">Bulk Content Generation</h3>
              <p className="text-sm text-gray-600">
                Generate AI content for {selectedLocations.size * selectedWebsites.size} location-service combinations
              </p>
            </div>
            <button
              onClick={handleGenerateContent}
              disabled={generatingContent || selectedLocations.size === 0 || selectedWebsites.size === 0}
              className={`px-6 py-3 rounded-lg font-bold text-white transition ${
                generatingContent || selectedLocations.size === 0 || selectedWebsites.size === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {generatingContent ? `Generating (${generationProgress.current}/${generationProgress.total})...` : 'Start Generation'}
            </button>
          </div>
        </div>

        {/* Location List */}
        {loading ? (
          <div className="text-center py-12">Loading locations...</div>
        ) : (
          <div className="space-y-3">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg font-semibold">
              <input
                type="checkbox"
                checked={selectedLocations.size === filteredLocations.length && filteredLocations.length > 0}
                onChange={toggleSelectAll}
                className="w-5 h-5"
              />
              <span>Select All ({filteredLocations.length})</span>
            </div>

            {/* Location Items */}
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedLocations.has(location.id)}
                    onChange={() => toggleLocationSelection(location.id)}
                    className="w-5 h-5 mt-1"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{location.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {location.type} • {location.region.replace('-', ' ')} • Population: {location.population.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{location.description.substring(0, 150)}...</p>

                    {/* Services Available */}
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      {WEBSITES.map((website) => (
                        <div key={website} className="bg-gray-100 p-2 rounded">
                          <div className="font-semibold capitalize text-gray-700">{website}</div>
                          <div className="text-gray-600">{location.applicableServices[website as keyof typeof location.applicableServices]} services</div>
                        </div>
                      ))}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3">
                      {location.contentGenerationStatus === 'completed' ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Content Generated
                        </span>
                      ) : location.contentGenerationStatus === 'in-progress' ? (
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ⟳ In Progress
                        </span>
                      ) : location.contentGenerationStatus === 'pending-approval' ? (
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ⊕ Pending Approval
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ○ Not Started
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
