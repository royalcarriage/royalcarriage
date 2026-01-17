import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, doc, updateDoc, addDoc, deleteDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';
import { canPerformAction } from '../lib/permissions';
import { Plus, Edit2, Trash2, Save, X, Loader2, RefreshCw, Car, AlertTriangle, CheckCircle } from 'lucide-react';

interface VehicleItem {
  id: string;
  name: string;
  category: 'sedan' | 'suv' | 'stretch' | 'van' | 'partybus' | 'coach';
  capacity: number;
  description: string;
  features: string[];
  imageUrl?: string;
  hourlyRate?: number;
  airportRate?: number;
  serviceIds: string[];
  status: 'active' | 'maintenance' | 'inactive';
  year?: number;
  make?: string;
  model?: string;
}

const VEHICLE_CATEGORIES = [
  { id: 'all', label: 'All Vehicles', icon: '🚗' },
  { id: 'sedan', label: 'Sedans', icon: '🚙' },
  { id: 'suv', label: 'SUVs', icon: '🚐' },
  { id: 'stretch', label: 'Stretch Limos', icon: '🚖' },
  { id: 'van', label: 'Vans', icon: '🚌' },
  { id: 'partybus', label: 'Party Bus', icon: '🎉' },
  { id: 'coach', label: 'Coach Bus', icon: '🚍' },
] as const;

// Vehicle Form Modal
function VehicleModal({
  isOpen,
  onClose,
  onSave,
  vehicle,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VehicleItem>) => void;
  vehicle?: VehicleItem;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<VehicleItem>>({
    name: '',
    category: 'sedan',
    capacity: 4,
    description: '',
    features: [],
    hourlyRate: 0,
    airportRate: 0,
    status: 'active',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    serviceIds: [],
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    } else {
      setFormData({
        name: '',
        category: 'sedan',
        capacity: 4,
        description: '',
        features: [],
        hourlyRate: 0,
        airportRate: 0,
        status: 'active',
        year: new Date().getFullYear(),
        make: '',
        model: '',
        serviceIds: [],
      });
    }
  }, [vehicle, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Lincoln MKT Stretch"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                value={formData.make || ''}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Lincoln"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., MKT"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category || 'sedan'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as VehicleItem['category'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="stretch">Stretch Limo</option>
                <option value="van">Van</option>
                <option value="partybus">Party Bus</option>
                <option value="coach">Coach Bus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleItem['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity || 4}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                value={formData.hourlyRate || 0}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airport Rate ($)</label>
              <input
                type="number"
                value={formData.airportRate || 0}
                onChange={(e) => setFormData({ ...formData, airportRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this vehicle..."
            />
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
            {vehicle ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FleetManagementPage() {
  const { user, role } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const canEdit = canPerformAction(role, 'editSettings');
  const canDelete = canPerformAction(role, 'deleteContent');

  // Real-time subscription to vehicles
  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'vehicles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VehicleItem[];

      items.sort((a, b) => {
        const categoryOrder = ['sedan', 'suv', 'stretch', 'van', 'partybus', 'coach'];
        const catCompare = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
      });

      setVehicles(items);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to vehicles:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  async function loadVehicles() {
    try {
      setLoading(true);
      const q = query(collection(db, 'vehicles'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VehicleItem[];

      items.sort((a, b) => {
        const categoryOrder = ['sedan', 'suv', 'stretch', 'van', 'partybus', 'coach'];
        const catCompare = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
      });

      setVehicles(items);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  // Create or Update vehicle
  async function handleSaveVehicle(data: Partial<VehicleItem>) {
    if (!canEdit) {
      alert('You do not have permission to edit vehicles');
      return;
    }

    setIsSaving(true);
    try {
      if (editingVehicle) {
        // Update existing
        await updateDoc(doc(db, 'vehicles', editingVehicle.id), {
          ...data,
          updatedAt: Timestamp.now(),
          updatedBy: user?.email,
        });

        // Log activity
        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Updated vehicle: ${data.name}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      } else {
        // Create new
        await addDoc(collection(db, 'vehicles'), {
          ...data,
          serviceIds: data.serviceIds || [],
          createdAt: Timestamp.now(),
          createdBy: user?.email,
        });

        // Log activity
        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Added new vehicle: ${data.name}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      }

      setIsModalOpen(false);
      setEditingVehicle(undefined);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Failed to save vehicle. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  // Delete vehicle
  async function handleDeleteVehicle(vehicle: VehicleItem) {
    if (!canDelete) {
      alert('You do not have permission to delete vehicles');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${vehicle.name}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(vehicle.id);
    try {
      await deleteDoc(doc(db, 'vehicles', vehicle.id));

      // Log activity
      await addDoc(collection(db, 'activity_log'), {
        type: 'system',
        message: `Deleted vehicle: ${vehicle.name}`,
        status: 'success',
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  }

  // Open edit modal
  function handleEditVehicle(vehicle: VehicleItem) {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }

  // Open create modal
  function handleCreateVehicle() {
    setEditingVehicle(undefined);
    setIsModalOpen(true);
  }

  // Update vehicle status quickly
  async function handleStatusChange(vehicle: VehicleItem, newStatus: VehicleItem['status']) {
    if (!canEdit) {
      alert('You do not have permission to update vehicle status');
      return;
    }

    try {
      await updateDoc(doc(db, 'vehicles', vehicle.id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
        updatedBy: user?.email,
      });

      // Log activity
      await addDoc(collection(db, 'activity_log'), {
        type: 'system',
        message: `Changed ${vehicle.name} status to ${newStatus}`,
        status: 'success',
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      alert('Failed to update status');
    }
  }

  const filteredVehicles = selectedCategory === 'all'
    ? vehicles
    : vehicles.filter((v) => v.category === selectedCategory);

  function getCategoryIcon(category: string) {
    const cat = VEHICLE_CATEGORIES.find((c) => c.id === category);
    return cat?.icon || '🚗';
  }

  function getCategoryColor(category: string) {
    const colors: Record<string, string> = {
      sedan: 'blue',
      suv: 'green',
      stretch: 'purple',
      van: 'orange',
      partybus: 'pink',
      coach: 'indigo',
    };
    return colors[category] || 'gray';
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingVehicle(undefined); }}
        onSave={handleSaveVehicle}
        vehicle={editingVehicle}
        isLoading={isSaving}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold">Fleet Management</h1>
            <div className="flex gap-2">
              <button
                onClick={loadVehicles}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {canEdit && (
                <button
                  onClick={handleCreateVehicle}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </button>
              )}
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                List
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Manage your fleet of {vehicles.length} premium vehicles across all service categories
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600">{vehicles.length}</div>
            <div className="text-gray-600">Total Vehicles</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-green-600">
              {vehicles.filter((v) => v.status === 'active').length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-orange-600">
              {vehicles.filter((v) => v.status === 'maintenance').length}
            </div>
            <div className="text-gray-600">In Maintenance</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(vehicles.reduce((sum, v) => sum + v.capacity, 0) / vehicles.length)}
            </div>
            <div className="text-gray-600">Avg Capacity</div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {VEHICLE_CATEGORIES.map((cat) => {
              const count = cat.id === 'all'
                ? vehicles.length
                : vehicles.filter((v) => v.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicles Display */}
        {loading ? (
          <div className="text-center py-12">Loading vehicles...</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => {
              const color = getCategoryColor(vehicle.category);
              const icon = getCategoryIcon(vehicle.category);

              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Vehicle Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
                        {vehicle.make && vehicle.model && (
                          <p className="text-sm text-gray-500">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 capitalize`}>
                        {vehicle.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {vehicle.description}
                    </p>

                    {/* Capacity and Rates */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-500">Capacity</div>
                        <div className="font-bold text-gray-900">{vehicle.capacity} passengers</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-500">Services</div>
                        <div className="font-bold text-gray-900">{vehicle.serviceIds.length}</div>
                      </div>
                    </div>

                    {/* Pricing */}
                    {(vehicle.hourlyRate || vehicle.airportRate) && (
                      <div className="mb-4 text-sm">
                        {vehicle.hourlyRate && (
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Hourly Rate:</span>
                            <span className="font-semibold text-gray-900">
                              ${vehicle.hourlyRate}/hr
                            </span>
                          </div>
                        )}
                        {vehicle.airportRate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Airport Rate:</span>
                            <span className="font-semibold text-gray-900">
                              ${vehicle.airportRate}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Features */}
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {vehicle.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {vehicle.features.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              +{vehicle.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status === 'active' ? '✓ Active' : vehicle.status === 'maintenance' ? '⚠ Maintenance' : 'Inactive'}
                      </span>
                    </div>

                    {/* Quick Status Toggle */}
                    {canEdit && (
                      <div className="flex gap-1 mb-4">
                        <button
                          onClick={() => handleStatusChange(vehicle, 'active')}
                          className={`flex-1 px-2 py-1 text-xs rounded ${vehicle.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />Active
                        </button>
                        <button
                          onClick={() => handleStatusChange(vehicle, 'maintenance')}
                          className={`flex-1 px-2 py-1 text-xs rounded ${vehicle.status === 'maintenance' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'}`}
                        >
                          <AlertTriangle className="w-3 h-3 inline mr-1" />Maint
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteVehicle(vehicle)}
                          disabled={isDeleting === vehicle.id}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium disabled:opacity-50"
                        >
                          {isDeleting === vehicle.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => {
                  const color = getCategoryColor(vehicle.category);

                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{vehicle.name}</div>
                        {vehicle.make && vehicle.model && (
                          <div className="text-sm text-gray-500">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 capitalize`}>
                          {vehicle.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.capacity} passengers
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.hourlyRate && <div>${vehicle.hourlyRate}/hr</div>}
                        {vehicle.airportRate && <div>${vehicle.airportRate} airport</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.serviceIds.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : vehicle.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleStatusChange(vehicle, vehicle.status === 'active' ? 'maintenance' : 'active')}
                                className={`p-1.5 rounded ${vehicle.status === 'active' ? 'hover:bg-yellow-100 text-yellow-600' : 'hover:bg-green-100 text-green-600'}`}
                                title={vehicle.status === 'active' ? 'Set to maintenance' : 'Set to active'}
                              >
                                {vehicle.status === 'active' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleEditVehicle(vehicle)}
                                className="p-1.5 hover:bg-blue-100 rounded text-blue-600"
                                title="Edit vehicle"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteVehicle(vehicle)}
                              disabled={isDeleting === vehicle.id}
                              className="p-1.5 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                              title="Delete vehicle"
                            >
                              {isDeleting === vehicle.id ? (
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
          </div>
        )}

        {filteredVehicles.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            No vehicles found in this category
          </div>
        )}
      </div>
    </div>
  );
}
