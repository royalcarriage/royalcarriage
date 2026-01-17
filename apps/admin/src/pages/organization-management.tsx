/**
 * Organization Management Page (SaaS Admin Only)
 *
 * This page provides comprehensive organization management:
 * - List all organizations
 * - Create new organization
 * - Edit organization settings
 * - View users in each organization
 * - Switch between organizations to view their data
 */

import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  Shield,
  Lock,
  Globe,
  Mail,
  User,
  UserPlus,
  Power,
  PowerOff,
} from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ensureFirebaseApp } from "../lib/firebaseClient";
import { useAuth } from "../state/AuthProvider";

// ============================================
// Types
// ============================================

interface OrganizationData {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, unknown>;
  userCount?: number;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrganizationFormData {
  name: string;
  adminEmail?: string;
  adminPassword?: string;
  adminDisplayName?: string;
  settings?: Record<string, unknown>;
}

interface EditOrganizationFormData {
  organizationId: string;
  name: string;
  isActive: boolean;
  settings?: Record<string, unknown>;
}

// ============================================
// Components
// ============================================

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      {isActive ? (
        <>
          <Power className="w-3 h-3" />
          Active
        </>
      ) : (
        <>
          <PowerOff className="w-3 h-3" />
          Inactive
        </>
      )}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleColors: Record<string, string> = {
    dispatcher: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    accountant: "bg-green-500/10 text-green-400 border-green-500/20",
    fleet_manager: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    saas_admin: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${
        roleColors[role] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
      }`}
    >
      <Shield className="w-3 h-3" />
      {role}
    </span>
  );
}

function OrganizationCard({
  organization,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewUsers,
  onToggleStatus,
}: {
  organization: OrganizationData;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewUsers: () => void;
  onToggleStatus: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`bg-slate-800/50 border rounded-xl p-4 hover:border-slate-600 transition-colors cursor-pointer ${
        isSelected ? "border-amber-500/50 bg-amber-500/5" : "border-slate-700"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              organization.isActive
                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
                : "bg-slate-700/50"
            }`}
          >
            <Building2
              className={`w-6 h-6 ${
                organization.isActive ? "text-amber-400" : "text-slate-500"
              }`}
            />
          </div>
          <div>
            <h3 className="text-white font-medium">{organization.name}</h3>
            <p className="text-sm text-slate-400">ID: {organization.id}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onViewUsers();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Users className="w-4 h-4" />
                  View Users
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Organization
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onToggleStatus();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {organization.isActive ? (
                    <>
                      <PowerOff className="w-4 h-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                <hr className="my-1 border-slate-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Organization
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge isActive={organization.isActive} />
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
          <Users className="w-3 h-3" />
          {organization.userCount || 0} users
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-500">Created</span>
          <p className="text-slate-300 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {new Date(organization.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Last Updated</span>
          <p className="text-slate-300 flex items-center gap-1 mt-1">
            <Activity className="w-3 h-3" />
            {new Date(organization.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function UserListItem({ user }: { user: UserData }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {user.displayName || "Unnamed User"}
          </p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RoleBadge role={user.role} />
        <span
          className={`w-2 h-2 rounded-full ${
            user.isActive ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
      </div>
    </div>
  );
}

function CreateOrganizationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrganizationFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateOrganizationFormData>({
    name: "",
    adminEmail: "",
    adminPassword: "",
    adminDisplayName: "",
  });
  const [createAdmin, setCreateAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Organization name is required (min 2 characters)";
    }

    if (createAdmin) {
      if (
        !formData.adminEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)
      ) {
        newErrors.adminEmail = "Valid admin email is required";
      }
      if (!formData.adminPassword || formData.adminPassword.length < 8) {
        newErrors.adminPassword = "Password must be at least 8 characters";
      }
      if (
        !formData.adminDisplayName ||
        formData.adminDisplayName.trim().length < 2
      ) {
        newErrors.adminDisplayName = "Admin display name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData: CreateOrganizationFormData = {
        name: formData.name,
      };

      if (createAdmin) {
        submitData.adminEmail = formData.adminEmail;
        submitData.adminPassword = formData.adminPassword;
        submitData.adminDisplayName = formData.adminDisplayName;
      }

      onSubmit(submitData);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        adminEmail: "",
        adminPassword: "",
        adminDisplayName: "",
      });
      setCreateAdmin(false);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Create Organization
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                errors.name ? "border-red-500" : "border-slate-700"
              }`}
              placeholder="Royal Carriage Limousine"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Create Admin Checkbox */}
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createAdmin}
                onChange={(e) => setCreateAdmin(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
              />
              <div>
                <span className="text-sm font-medium text-white">
                  Create Admin User
                </span>
                <p className="text-xs text-slate-400">
                  Create an administrator account for this organization
                </p>
              </div>
            </label>
          </div>

          {/* Admin Fields */}
          {createAdmin && (
            <div className="space-y-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                Admin User Details
              </h4>

              {/* Admin Display Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Name *
                </label>
                <input
                  type="text"
                  value={formData.adminDisplayName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adminDisplayName: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                    errors.adminDisplayName
                      ? "border-red-500"
                      : "border-slate-700"
                  }`}
                  placeholder="John Doe"
                />
                {errors.adminDisplayName && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.adminDisplayName}
                  </p>
                )}
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, adminEmail: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                    errors.adminEmail ? "border-red-500" : "border-slate-700"
                  }`}
                  placeholder="admin@organization.com"
                />
                {errors.adminEmail && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.adminEmail}
                  </p>
                )}
              </div>

              {/* Admin Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.adminPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adminPassword: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 pr-10 bg-slate-800 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                      errors.adminPassword
                        ? "border-red-500"
                        : "border-slate-700"
                    }`}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.adminPassword && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.adminPassword}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700 sticky bottom-0 bg-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl text-sm font-medium text-slate-900 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Organization
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditOrganizationModal({
  isOpen,
  onClose,
  onSubmit,
  organization,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditOrganizationFormData) => void;
  organization: OrganizationData | null;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<EditOrganizationFormData>({
    organizationId: "",
    name: "",
    isActive: true,
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        organizationId: organization.id,
        name: organization.name,
        isActive: organization.isActive,
      });
    }
  }, [organization]);

  const handleSubmit = () => {
    if (formData.name.trim().length >= 2) {
      onSubmit(formData);
    }
  };

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-amber-400" />
            Edit Organization
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: true })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                  formData.isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Power className="w-4 h-4" />
                Active
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: false })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                  !formData.isActive
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <PowerOff className="w-4 h-4" />
                Inactive
              </button>
            </div>
          </div>

          {/* Organization Info */}
          <div className="p-4 bg-slate-900/50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Organization ID</span>
              <span className="text-slate-300 font-mono">
                {organization.id}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Users</span>
              <span className="text-slate-300">
                {organization.userCount || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Created</span>
              <span className="text-slate-300">
                {new Date(organization.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl text-sm font-medium text-slate-900 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewUsersModal({
  isOpen,
  onClose,
  organization,
  users,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationData | null;
  users: UserData[];
  isLoading: boolean;
}) {
  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Users in {organization.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {users.length} {users.length === 1 ? "user" : "users"} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Users className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-400">No users in this organization</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <UserListItem key={user.uid} user={user} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  organization,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete: boolean) => void;
  organization: OrganizationData | null;
  isLoading: boolean;
}) {
  const [hardDelete, setHardDelete] = useState(false);

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete Organization?
          </h3>
          <p className="text-slate-400 mb-4">
            Are you sure you want to delete{" "}
            <span className="text-white font-medium">{organization.name}</span>?
          </p>

          {organization.userCount && organization.userCount > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 text-left">
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                This organization has {organization.userCount} users
              </p>
            </div>
          )}

          <div className="p-4 bg-slate-900/50 rounded-xl text-left">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded bg-slate-700 border-slate-600 text-red-500 focus:ring-red-500 focus:ring-offset-0"
              />
              <div>
                <span className="text-sm font-medium text-white">
                  Permanent Delete
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Delete organization and deactivate all associated users. This
                  cannot be undone.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(hardDelete)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl text-sm font-medium text-white transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {hardDelete ? "Delete Permanently" : "Deactivate"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function OrganizationManagementPage() {
  const { role } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Check if user is SaaS admin
  // `role` may be a narrow union type; cast to string for custom admin checks
  const isSaasAdmin = ["superadmin", "saas_admin"].includes(role as string);

  // Load organizations
  const loadOrganizations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const listOrganizations = httpsCallable<
        { includeInactive?: boolean },
        { organizations: OrganizationData[]; count: number }
      >(functions, "listOrganizations");

      const result = await listOrganizations({ includeInactive: true });
      setOrganizations(result.data.organizations);
    } catch (err: unknown) {
      console.error("Error loading organizations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load organizations",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load users for an organization
  const loadOrganizationUsers = async (organizationId: string) => {
    setIsUsersLoading(true);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const getOrganizationUsers = httpsCallable<
        { organizationId: string; includeInactive?: boolean },
        { users: UserData[] }
      >(functions, "getOrganizationUsers");

      const result = await getOrganizationUsers({
        organizationId,
        includeInactive: true,
      });

      setOrganizationUsers(result.data.users);
    } catch (err: unknown) {
      console.error("Error loading organization users:", err);
      setOrganizationUsers([]);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isSaasAdmin) {
      loadOrganizations();
    }
  }, [isSaasAdmin]);

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !org.name.toLowerCase().includes(query) &&
          !org.id.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (statusFilter === "active" && !org.isActive) {
        return false;
      }
      if (statusFilter === "inactive" && org.isActive) {
        return false;
      }

      return true;
    });
  }, [organizations, searchQuery, statusFilter]);

  // Create organization
  const handleCreateOrganization = async (data: CreateOrganizationFormData) => {
    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const createOrganization = httpsCallable(functions, "createOrganization");

      await createOrganization(data);

      setShowCreateModal(false);
      setSuccessMessage("Organization created successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      loadOrganizations();
    } catch (err: unknown) {
      console.error("Error creating organization:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create organization",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update organization
  const handleUpdateOrganization = async (data: EditOrganizationFormData) => {
    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const updateOrganization = httpsCallable(functions, "updateOrganization");

      await updateOrganization(data);

      setShowEditModal(false);
      setSelectedOrg(null);
      setSuccessMessage("Organization updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      loadOrganizations();
    } catch (err: unknown) {
      console.error("Error updating organization:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update organization",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete organization
  const handleDeleteOrganization = async (hardDelete: boolean) => {
    if (!selectedOrg) return;

    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const deleteOrganization = httpsCallable(functions, "deleteOrganization");

      await deleteOrganization({
        organizationId: selectedOrg.id,
        hardDelete,
      });

      setShowDeleteModal(false);
      setSelectedOrg(null);
      setSuccessMessage(
        hardDelete
          ? "Organization deleted permanently"
          : "Organization deactivated successfully",
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      loadOrganizations();
    } catch (err: unknown) {
      console.error("Error deleting organization:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete organization",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle organization status
  const handleToggleStatus = async (org: OrganizationData) => {
    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const updateOrganization = httpsCallable(functions, "updateOrganization");

      await updateOrganization({
        organizationId: org.id,
        isActive: !org.isActive,
      });

      setSuccessMessage(
        `Organization ${org.isActive ? "deactivated" : "activated"} successfully`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      loadOrganizations();
    } catch (err: unknown) {
      console.error("Error toggling organization status:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update organization status",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // View users handler
  const handleViewUsers = (org: OrganizationData) => {
    setSelectedOrg(org);
    loadOrganizationUsers(org.id);
    setShowUsersModal(true);
  };

  // Access denied for non-SaaS admins
  if (!isSaasAdmin) {
    return (
      <div className="p-6 bg-slate-950 min-h-screen">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center p-8">
            <div className="p-4 rounded-2xl bg-red-500/10 mb-6 inline-block">
              <Lock className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              SaaS Admin Access Required
            </h2>
            <p className="text-slate-400 max-w-md">
              Organization management is only available to SaaS Administrators.
              Please contact your platform administrator for access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Organization Management
          </h1>
          <p className="text-slate-400">
            Manage all organizations on the Royal Carriage platform
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-xl text-sm font-medium text-slate-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Organization
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {organizations.length}
              </p>
              <p className="text-sm text-slate-400">Total Organizations</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Power className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {organizations.filter((o) => o.isActive).length}
              </p>
              <p className="text-sm text-slate-400">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <PowerOff className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {organizations.filter((o) => !o.isActive).length}
              </p>
              <p className="text-sm text-slate-400">Inactive</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {organizations.reduce((sum, o) => sum + (o.userCount || 0), 0)}
              </p>
              <p className="text-sm text-slate-400">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadOrganizations}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-white transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Organizations Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No organizations found
          </h3>
          <p className="text-slate-400 max-w-md">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first organization"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              isSelected={selectedOrg?.id === org.id}
              onSelect={() => setSelectedOrg(org)}
              onEdit={() => {
                setSelectedOrg(org);
                setShowEditModal(true);
              }}
              onDelete={() => {
                setSelectedOrg(org);
                setShowDeleteModal(true);
              }}
              onViewUsers={() => handleViewUsers(org)}
              onToggleStatus={() => handleToggleStatus(org)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOrganization}
        isLoading={isActionLoading}
      />

      <EditOrganizationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrg(null);
        }}
        onSubmit={handleUpdateOrganization}
        organization={selectedOrg}
        isLoading={isActionLoading}
      />

      <ViewUsersModal
        isOpen={showUsersModal}
        onClose={() => {
          setShowUsersModal(false);
          setOrganizationUsers([]);
        }}
        organization={selectedOrg}
        users={organizationUsers}
        isLoading={isUsersLoading}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrg(null);
        }}
        onConfirm={handleDeleteOrganization}
        organization={selectedOrg}
        isLoading={isActionLoading}
      />
    </div>
  );
}
