import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ensureFirebaseApp } from '../lib/firebaseClient';
import { useAuth } from '../state/AuthProvider';
import { canPerformAction } from '../lib/permissions';
import { Plus, Edit2, Trash2, Save, X, MapPin, Loader2, Search, Filter, RefreshCw } from 'lucide-react';

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

// Location Form Modal
function LocationModal({
  isOpen,
  onClose,
  onSave,
  location,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<LocationItem>) => void;
  location?: LocationItem;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<LocationItem>>({
    name: '',
    state: 'IL',
    type: 'neighborhood',
    region: 'downtown',
    description: '',
    population: 0,
    zipCodes: [],
    coordinates: { lat: 41.8781, lng: -87.6298 },
    applicableServices: { airport: 10, corporate: 8, wedding: 6, partyBus: 4 },
  });

  useEffect(() => {
    if (location) {
      setFormData(location);
    } else {
      setFormData({
        name: '',
        state: 'IL',
        type: 'neighborhood',
        region: 'downtown',
        description: '',
        population: 0,
        zipCodes: [],
        coordinates: { lat: 41.8781, lng: -87.6298 },
        applicableServices: { airport: 10, corporate: 8, wedding: 6, partyBus: 4 },
      });
    }
  }, [location, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {location ? 'Edit Location' : 'Add New Location'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Lincoln Park"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state || 'IL'}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type || 'neighborhood'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'neighborhood' | 'suburb' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="neighborhood">Neighborhood</option>
                <option value="suburb">Suburb</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={formData.region || 'downtown'}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>{region.replace('-', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
            <input
              type="number"
              value={formData.population || 0}
              onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of this location..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Services (count per website)</label>
            <div className="grid grid-cols-4 gap-3">
              {WEBSITES.map((website) => (
                <div key={website}>
                  <label className="block text-xs text-gray-500 capitalize mb-1">{website}</label>
                  <input
                    type="number"
                    value={formData.applicableServices?.[website as keyof typeof formData.applicableServices] || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      applicableServices: {
                        ...formData.applicableServices!,
                        [website]: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={isLoading || !formData.name}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {location ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const canEdit = canPerformAction(role, 'editSettings');
  const canDelete = canPerformAction(role, 'deleteContent');

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
        const regionCompare = (a.region || '').localeCompare(b.region || '');
        if (regionCompare !== 0) return regionCompare;
        return (a.name || '').localeCompare(b.name || '');
      });

      setLocations(items);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  }

  // Create or Update location
  async function handleSaveLocation(data: Partial<LocationItem>) {
    if (!canEdit) {
      alert('You do not have permission to edit locations');
      return;
    }

    setIsSaving(true);
    try {
      if (editingLocation) {
        // Update existing
        await updateDoc(doc(db, 'locations', editingLocation.id), {
          ...data,
          updatedAt: Timestamp.now(),
          updatedBy: user?.email,
        });

        // Log activity
        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Updated location: ${data.name}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      } else {
        // Create new
        await addDoc(collection(db, 'locations'), {
          ...data,
          contentGenerationStatus: 'not-started',
          createdAt: Timestamp.now(),
          createdBy: user?.email,
        });

        // Log activity
        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Created new location: ${data.name}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      }

      setIsModalOpen(false);
      setEditingLocation(undefined);
      loadLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  // Delete location
  async function handleDeleteLocation(location: LocationItem) {
    if (!canDelete) {
      alert('You do not have permission to delete locations');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${location.name}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(location.id);
    try {
      await deleteDoc(doc(db, 'locations', location.id));

      // Log activity
      await addDoc(collection(db, 'activity_log'), {
        type: 'system',
        message: `Deleted location: ${location.name}`,
        status: 'success',
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });

      loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  }

  // Open edit modal
  function handleEditLocation(location: LocationItem) {
    setEditingLocation(location);
    setIsModalOpen(true);
  }

  // Open create modal
  function handleCreateLocation() {
    setEditingLocation(undefined);
    setIsModalOpen(true);
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
      {/* Location Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLocation(undefined); }}
        onSave={handleSaveLocation}
        location={editingLocation}
        isLoading={isSaving}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Location Management</h1>
            <p className="text-gray-600">
              Manage 240+ Chicago locations and generate AI content for services
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadLocations}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canEdit && (
              <button
                onClick={handleCreateLocation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            )}
          </div>
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

        {/* Search and Filters */}
        <div className="mb-6 bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Search and Filters</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Locations
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="neighborhood">Neighborhoods</option>
                <option value="suburb">Suburbs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results
              </label>
              <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-blue-600">
                {filteredLocations.length} locations
              </div>
            </div>
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
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-lg">{location.name}</h4>
                      <div className="flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEditLocation(location)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                            title="Edit location"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteLocation(location)}
                            disabled={isDeleting === location.id}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 disabled:opacity-50"
                            title="Delete location"
                          >
                            {isDeleting === location.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {location.type} • {(location.region || '').replace('-', ' ')} • Population: {(location.population || 0).toLocaleString()}
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
