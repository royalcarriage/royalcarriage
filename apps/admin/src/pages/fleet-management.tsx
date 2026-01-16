import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';
import { Modal } from '../components/ui/Modal';

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

export default function FleetManagementPage() {
  const { user, role } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadVehicles();
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

  const filteredVehicles = selectedCategory === 'all'
    ? vehicles
    : vehicles.filter((v) => v.category === selectedCategory);

  function handleEditVehicle(vehicle: VehicleItem) {
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  }

  async function handleSaveVehicle() {
    if (!editingVehicle) return;

    try {
      await updateDoc(doc(db, 'vehicles', editingVehicle.id), {
        name: editingVehicle.name,
        capacity: editingVehicle.capacity,
        description: editingVehicle.description,
        features: editingVehicle.features,
        hourlyRate: editingVehicle.hourlyRate,
        airportRate: editingVehicle.airportRate,
        status: editingVehicle.status,
      });

      setShowEditModal(false);
      loadVehicles();
      alert('Vehicle updated successfully');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle');
    }
  }

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold">Fleet Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                List View
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Manage your fleet of 14 premium vehicles across all service categories
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

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Edit Details
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                        View Services
                      </button>
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
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Services
                        </button>
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

        {/* Edit Vehicle Modal */}
        {editingVehicle && (
          <Modal
            open={showEditModal}
            title={`Edit ${editingVehicle.name}`}
            onClose={() => setShowEditModal(false)}
            primaryAction={{
              label: 'Save Changes',
              onClick: handleSaveVehicle,
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={editingVehicle.name}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={editingVehicle.capacity}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingVehicle.description}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.hourlyRate || ''}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airport Rate ($)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.airportRate || ''}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        airportRate: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingVehicle.status}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      status: e.target.value as 'active' | 'maintenance' | 'inactive',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
