import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';
import { canPerformAction } from '../lib/permissions';
import { Plus, Edit2, Trash2, Save, X, Loader2, RefreshCw, Eye, Sparkles } from 'lucide-react';

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

// Service Form Modal
function ServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ServiceItem>) => void;
  service?: ServiceItem;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    name: '',
    slug: '',
    description: '',
    website: 'airport',
    locationCount: 0,
    vehicleCount: 0,
    contentGenerated: 0,
    contentTotal: 0,
    status: 'draft',
    features: [],
    basePrice: 0,
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        website: 'airport',
        locationCount: 0,
        vehicleCount: 0,
        contentGenerated: 0,
        contentTotal: 0,
        status: 'draft',
        features: [],
        basePrice: 0,
      });
    }
  }, [service, isOpen]);

  function handleAddFeature() {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()],
      });
      setNewFeature('');
    }
  }

  function handleRemoveFeature(index: number) {
    setFormData({
      ...formData,
      features: (formData.features || []).filter((_, i) => i !== index),
    });
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Airport Transfer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <select
                value={formData.website || 'airport'}
                onChange={(e) => setFormData({ ...formData, website: e.target.value as ServiceItem['website'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="airport">Airport</option>
                <option value="corporate">Corporate</option>
                <option value="wedding">Wedding</option>
                <option value="partyBus">Party Bus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status || 'draft'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceItem['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this service..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Count</label>
              <input
                type="number"
                value={formData.locationCount || 0}
                onChange={(e) => setFormData({ ...formData, locationCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Count</label>
              <input
                type="number"
                value={formData.vehicleCount || 0}
                onChange={(e) => setFormData({ ...formData, vehicleCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
              <input
                type="number"
                value={formData.basePrice || 0}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a feature..."
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.features || []).map((feature, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {feature}
                  <button type="button" onClick={() => handleRemoveFeature(idx)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
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
            {service ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesManagementPage() {
  const { user, role } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [generatingContent, setGeneratingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const canEdit = canPerformAction(role, 'editSettings');
  const canDelete = canPerformAction(role, 'deleteContent');

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

  // Create or Update service
  async function handleSaveService(data: Partial<ServiceItem>) {
    if (!canEdit) {
      alert('You do not have permission to edit services');
      return;
    }

    setIsSaving(true);
    try {
      if (editingService) {
        // Update existing
        await updateDoc(doc(db, 'services', editingService.id), {
          ...data,
          lastUpdated: new Date().toISOString(),
          updatedBy: user?.email,
        });

        // Log activity
        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Updated service: ${data.name}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      } else {
        // Create new
        await addDoc(collection(db, 'services'), {
          ...data,
          contentGenerated: 0,
          contentTotal: data.locationCount || 0,
          createdAt: Timestamp.now(),
          createdBy: user?.email,
          lastUpdated: new Date().toISOString(),
        });

        // Log activity
        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Created new service: ${data.name}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      }

      setIsModalOpen(false);
      setEditingService(undefined);
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  // Delete service
  async function handleDeleteService(service: ServiceItem) {
    if (!canDelete) {
      alert('You do not have permission to delete services');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${service.name}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(service.id);
    try {
      await deleteDoc(doc(db, 'services', service.id));

      // Log activity
      await addDoc(collection(db, 'activity_log'), {
        type: 'system',
        message: `Deleted service: ${service.name}`,
        status: 'success',
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });

      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  }

  // Open edit modal
  function handleEditService(service: ServiceItem) {
    setEditingService(service);
    setIsModalOpen(true);
  }

  // Open create modal
  function handleCreateService() {
    setEditingService(undefined);
    setIsModalOpen(true);
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
      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingService(undefined); }}
        onSave={handleSaveService}
        service={editingService}
        isLoading={isSaving}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Service Management</h1>
            <p className="text-gray-600">
              Manage {services.length} services across 4 websites and generate AI content
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadServices}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canEdit && (
              <button
                onClick={handleCreateService}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            )}
          </div>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleServiceSelection(service.id)}
                            className="p-1.5 hover:bg-green-100 rounded text-green-600"
                            title="Generate content"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-1.5 hover:bg-blue-100 rounded text-blue-600"
                              title="Edit service"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteService(service)}
                              disabled={isDeleting === service.id}
                              className="p-1.5 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                              title="Delete service"
                            >
                              {isDeleting === service.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
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
