import React, { useEffect, useState, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, getDocs, query, doc, updateDoc, addDoc, deleteDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../state/AuthProvider';
import { canPerformAction } from '../lib/permissions';
import {
  Plus, Edit2, Trash2, Save, X, Loader2, RefreshCw, User,
  Phone, Mail, Car, Star, Calendar, Clock, CheckCircle,
  AlertTriangle, Upload, Image as ImageIcon, FileText
} from 'lucide-react';

interface Driver {
  id: string;
  tenantId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: Timestamp;
    licenseNumber: string;
    licenseState: string;
    licenseExpiration?: Timestamp;
  };
  employment: {
    status: 'active' | 'inactive' | 'on_leave' | 'terminated';
    hireDate?: Timestamp;
    employmentType: 'employee' | 'contractor' | '1099';
  };
  performance: {
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    averageRating: number;
    totalRatings: number;
    acceptanceRate: number;
    cancellationRate: number;
  };
  availability: {
    currentStatus: 'offline' | 'online' | 'on_ride' | 'on_break';
    availableVehicleIds: string[];
  };
  ratings: {
    totalRatings: number;
    averageRating: number;
    byCategory: {
      cleanliness: number;
      professionalism: number;
      safetyDriving: number;
      customerService: number;
    };
  };
  vehicleTypes: string[];
  specializations: string[];
  profileImage?: string;
  created?: Timestamp;
  updated?: Timestamp;
}

const STATUS_OPTIONS = [
  { id: 'active', label: 'Active', color: 'green', icon: CheckCircle },
  { id: 'on_leave', label: 'On Leave', color: 'yellow', icon: Clock },
  { id: 'inactive', label: 'Inactive', color: 'gray', icon: AlertTriangle },
  { id: 'terminated', label: 'Terminated', color: 'red', icon: X },
];

const AVAILABILITY_OPTIONS = [
  { id: 'online', label: 'Online', color: 'green' },
  { id: 'offline', label: 'Offline', color: 'gray' },
  { id: 'on_ride', label: 'On Ride', color: 'blue' },
  { id: 'on_break', label: 'On Break', color: 'yellow' },
];

const VEHICLE_TYPES = ['sedan', 'suv', 'stretch_limo', 'party_bus', 'van', 'coach'];
const SPECIALIZATIONS = ['airport', 'corporate', 'wedding', 'partybus', 'vip', 'group', 'event', 'nightlife'];

// Driver Form Modal
function DriverModal({
  isOpen,
  onClose,
  onSave,
  driver,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Driver>) => void;
  driver?: Driver;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseState: 'IL',
    },
    employment: {
      status: 'active',
      employmentType: 'employee',
    },
    availability: {
      currentStatus: 'offline',
      availableVehicleIds: [],
    },
    vehicleTypes: [],
    specializations: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleImageUpload(): Promise<string | null> {
    if (!imageFile) return formData.profileImage || null;

    setUploadingImage(true);
    try {
      const driverId = `${formData.personalInfo?.firstName?.toLowerCase()}-${formData.personalInfo?.lastName?.toLowerCase()}` || `driver-${Date.now()}`;
      const storageRef = ref(storage, `driver-images/${driverId}-${Date.now()}.${imageFile.name.split('.').pop()}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  useEffect(() => {
    if (driver) {
      setFormData(driver);
      setImagePreview(driver.profileImage || null);
    } else {
      setFormData({
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          licenseNumber: '',
          licenseState: 'IL',
        },
        employment: {
          status: 'active',
          employmentType: 'employee',
        },
        availability: {
          currentStatus: 'offline',
          availableVehicleIds: [],
        },
        vehicleTypes: [],
        specializations: [],
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [driver, isOpen]);

  function toggleArrayItem(array: string[], item: string): string[] {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {driver ? 'Edit Driver' : 'Add New Driver'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <div className="flex items-start gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition overflow-hidden border-2 border-dashed border-gray-300"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
                {imageFile && (
                  <p className="text-xs text-green-600 mt-1">New photo selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.personalInfo?.firstName || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo!, firstName: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.personalInfo?.lastName || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo!, lastName: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.personalInfo?.email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo!, email: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.personalInfo?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo!, phone: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* License Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">License Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.personalInfo?.licenseNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo!, licenseNumber: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License State</label>
                <input
                  type="text"
                  value={formData.personalInfo?.licenseState || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo!, licenseState: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Employment */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Employment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.employment?.status || 'active'}
                  onChange={(e) => setFormData({
                    ...formData,
                    employment: { ...formData.employment!, status: e.target.value as Driver['employment']['status'] }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select
                  value={formData.employment?.employmentType || 'employee'}
                  onChange={(e) => setFormData({
                    ...formData,
                    employment: { ...formData.employment!, employmentType: e.target.value as Driver['employment']['employmentType'] }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employee">Employee</option>
                  <option value="contractor">Contractor</option>
                  <option value="1099">1099</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Types</label>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    vehicleTypes: toggleArrayItem(formData.vehicleTypes || [], type)
                  })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    formData.vehicleTypes?.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    specializations: toggleArrayItem(formData.specializations || [], spec)
                  })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    formData.specializations?.includes(spec)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {spec}
                </button>
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
            onClick={async () => {
              const imageUrl = await handleImageUpload();
              onSave({ ...formData, profileImage: imageUrl || formData.profileImage });
            }}
            disabled={isLoading || uploadingImage || !formData.personalInfo?.firstName || !formData.personalInfo?.lastName}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {(isLoading || uploadingImage) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {uploadingImage ? 'Uploading...' : driver ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DriverManagementPage() {
  const { user, role } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const canEdit = canPerformAction(role, 'editSettings');
  const canDelete = canPerformAction(role, 'deleteContent');

  // Real-time subscription to drivers
  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'drivers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[];

      items.sort((a, b) => {
        const statusOrder = ['active', 'on_leave', 'inactive', 'terminated'];
        const statusCompare = statusOrder.indexOf(a.employment?.status || 'inactive') - statusOrder.indexOf(b.employment?.status || 'inactive');
        if (statusCompare !== 0) return statusCompare;
        return `${a.personalInfo?.lastName} ${a.personalInfo?.firstName}`.localeCompare(`${b.personalInfo?.lastName} ${b.personalInfo?.firstName}`);
      });

      setDrivers(items);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to drivers:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  async function handleSaveDriver(data: Partial<Driver>) {
    if (!canEdit) {
      alert('You do not have permission to edit drivers');
      return;
    }

    setIsSaving(true);
    try {
      if (editingDriver) {
        await updateDoc(doc(db, 'drivers', editingDriver.id), {
          ...data,
          updated: Timestamp.now(),
        });

        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Updated driver: ${data.personalInfo?.firstName} ${data.personalInfo?.lastName}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      } else {
        const driverId = `${data.personalInfo?.firstName?.toLowerCase()}-${data.personalInfo?.lastName?.toLowerCase()}`;
        await addDoc(collection(db, 'drivers'), {
          ...data,
          tenantId: 'royal-carriage',
          performance: {
            totalRides: 0,
            completedRides: 0,
            cancelledRides: 0,
            averageRating: 0,
            totalRatings: 0,
            acceptanceRate: 0,
            cancellationRate: 0,
          },
          ratings: {
            totalRatings: 0,
            averageRating: 0,
            byCategory: {
              cleanliness: 0,
              professionalism: 0,
              safetyDriving: 0,
              customerService: 0,
            },
          },
          created: Timestamp.now(),
          updated: Timestamp.now(),
        });

        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Added new driver: ${data.personalInfo?.firstName} ${data.personalInfo?.lastName}`,
          status: 'success',
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: Timestamp.now(),
        });
      }

      setIsModalOpen(false);
      setEditingDriver(undefined);
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Failed to save driver. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteDriver(driver: Driver) {
    if (!canDelete) {
      alert('You do not have permission to delete drivers');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${driver.personalInfo?.firstName} ${driver.personalInfo?.lastName}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(driver.id);
    try {
      await deleteDoc(doc(db, 'drivers', driver.id));

      await addDoc(collection(db, 'activity_log'), {
        type: 'system',
        message: `Deleted driver: ${driver.personalInfo?.firstName} ${driver.personalInfo?.lastName}`,
        status: 'success',
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  }

  async function handleStatusChange(driver: Driver, newStatus: Driver['employment']['status']) {
    if (!canEdit) {
      alert('You do not have permission to update driver status');
      return;
    }

    try {
      await updateDoc(doc(db, 'drivers', driver.id), {
        'employment.status': newStatus,
        updated: Timestamp.now(),
      });

      await addDoc(collection(db, 'activity_log'), {
        type: 'system',
        message: `Changed ${driver.personalInfo?.firstName} ${driver.personalInfo?.lastName} status to ${newStatus}`,
        status: 'success',
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating driver status:', error);
      alert('Failed to update status');
    }
  }

  const filteredDrivers = statusFilter === 'all'
    ? drivers
    : drivers.filter((d) => d.employment?.status === statusFilter);

  function getStatusColor(status: string) {
    const opt = STATUS_OPTIONS.find(o => o.id === status);
    return opt?.color || 'gray';
  }

  function getAvailabilityColor(status: string) {
    const opt = AVAILABILITY_OPTIONS.find(o => o.id === status);
    return opt?.color || 'gray';
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <DriverModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDriver(undefined); }}
        onSave={handleSaveDriver}
        driver={editingDriver}
        isLoading={isSaving}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold">Driver Management</h1>
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={() => { setEditingDriver(undefined); setIsModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Driver
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
            Manage your team of {drivers.length} professional drivers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600">{drivers.length}</div>
            <div className="text-gray-600">Total Drivers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-green-600">
              {drivers.filter((d) => d.employment?.status === 'active').length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600">
              {drivers.filter((d) => d.availability?.currentStatus === 'online').length}
            </div>
            <div className="text-gray-600">Online Now</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-purple-600">
              {drivers.length > 0
                ? (drivers.reduce((sum, d) => sum + (d.ratings?.averageRating || 0), 0) / drivers.length).toFixed(2)
                : '0.00'
              }
            </div>
            <div className="text-gray-600">Avg Rating</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-orange-600">
              {drivers.reduce((sum, d) => sum + (d.performance?.totalRides || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Rides</div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({drivers.length})
            </button>
            {STATUS_OPTIONS.map((opt) => {
              const count = drivers.filter((d) => d.employment?.status === opt.id).length;
              return (
                <button
                  key={opt.id}
                  onClick={() => setStatusFilter(opt.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    statusFilter === opt.id
                      ? `bg-${opt.color}-600 text-white shadow-lg`
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Drivers Display */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading drivers...
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => {
              const statusColor = getStatusColor(driver.employment?.status || 'inactive');
              const availColor = getAvailabilityColor(driver.availability?.currentStatus || 'offline');

              return (
                <div
                  key={driver.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Driver Header */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {driver.profileImage ? (
                          <img src={driver.profileImage} alt={`${driver.personalInfo?.firstName}`} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {driver.personalInfo?.firstName} {driver.personalInfo?.lastName}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                            {driver.employment?.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${availColor}-100 text-${availColor}-800`}>
                            {driver.availability?.currentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{driver.personalInfo?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{driver.personalInfo?.phone}</span>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          Rating
                        </div>
                        <div className="font-bold text-gray-900">
                          {driver.ratings?.averageRating?.toFixed(1) || '0.0'}
                          <span className="text-xs text-gray-500 font-normal ml-1">
                            ({driver.ratings?.totalRatings || 0})
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                          <Car className="w-3 h-3" />
                          Rides
                        </div>
                        <div className="font-bold text-gray-900">
                          {driver.performance?.completedRides?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Types */}
                    {driver.vehicleTypes && driver.vehicleTypes.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {driver.vehicleTypes.map((type, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              {type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specializations */}
                    {driver.specializations && driver.specializations.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {driver.specializations.map((spec, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }}
                          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteDriver(driver)}
                          disabled={isDeleting === driver.id}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium disabled:opacity-50"
                        >
                          {isDeleting === driver.id ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rides</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => {
                  const statusColor = getStatusColor(driver.employment?.status || 'inactive');

                  return (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {driver.profileImage ? (
                              <img src={driver.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {driver.personalInfo?.firstName} {driver.personalInfo?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{driver.employment?.employmentType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{driver.personalInfo?.email}</div>
                        <div className="text-sm text-gray-500">{driver.personalInfo?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                          {driver.employment?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">{driver.ratings?.averageRating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500 text-sm">({driver.ratings?.totalRatings || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.performance?.completedRides?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {driver.vehicleTypes?.slice(0, 2).map((type, idx) => (
                            <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              {type.replace('_', ' ')}
                            </span>
                          ))}
                          {driver.vehicleTypes && driver.vehicleTypes.length > 2 && (
                            <span className="text-xs text-gray-500">+{driver.vehicleTypes.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <button
                              onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }}
                              className="p-1.5 hover:bg-blue-100 rounded text-blue-600"
                              title="Edit driver"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteDriver(driver)}
                              disabled={isDeleting === driver.id}
                              className="p-1.5 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                              title="Delete driver"
                            >
                              {isDeleting === driver.id ? (
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

        {filteredDrivers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            No drivers found with this status filter
          </div>
        )}
      </div>
    </div>
  );
}
