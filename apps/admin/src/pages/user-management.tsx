/**
 * User Management Page
 *
 * This page provides comprehensive user management:
 * - List all users (filtered by organization for non-saas_admin)
 * - Create new user form with role selection
 * - Edit user details and role
 * - Deactivate/delete users
 * - Search and filter users
 */

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  Mail,
  Calendar,
  Building2,
  ChevronDown,
  X,
  Check,
  Loader2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ensureFirebaseApp } from "../lib/firebaseClient";
import { useAuth } from "../state/AuthProvider";
import { Modal } from "../components/ui/Modal";

// ============================================
// Types
// ============================================

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

interface CreateUserFormData {
  email: string;
  password: string;
  displayName: string;
  role: string;
  organizationId: string;
}

interface EditUserFormData {
  uid: string;
  displayName: string;
  email: string;
  isActive: boolean;
}

type Role =
  | "dispatcher"
  | "accountant"
  | "fleet_manager"
  | "admin"
  | "saas_admin";

// ============================================
// Constants
// ============================================

const ROLES: {
  value: Role;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: "dispatcher",
    label: "Dispatcher",
    description: "Vehicle scheduling and assignments",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    value: "accountant",
    label: "Accountant",
    description: "Financial records and receipts",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    value: "fleet_manager",
    label: "Fleet Manager",
    description: "Vehicles, drivers, and maintenance",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Full organization access",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    value: "saas_admin",
    label: "SaaS Admin",
    description: "Platform-wide access",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
];

const ROLE_HIERARCHY: Record<Role, number> = {
  dispatcher: 1,
  accountant: 1,
  fleet_manager: 2,
  admin: 3,
  saas_admin: 4,
};

// ============================================
// Components
// ============================================

function RoleBadge({ role }: { role: string }) {
  const roleConfig = ROLES.find((r) => r.value === role) || {
    label: role,
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${roleConfig.color}`}
    >
      <Shield className="w-3 h-3" />
      {roleConfig.label}
    </span>
  );
}

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
          <UserCheck className="w-3 h-3" />
          Active
        </>
      ) : (
        <>
          <UserX className="w-3 h-3" />
          Inactive
        </>
      )}
    </span>
  );
}

function UserCard({
  user,
  currentUserRole,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  user: UserData;
  currentUserRole: Role;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const canManage =
    currentUserRole === "saas_admin" ||
    ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[user.role as Role];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <span className="text-lg font-bold text-amber-400">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h3 className="text-white font-medium">
              {user.displayName || "Unnamed User"}
            </h3>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit User
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleStatus();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="w-4 h-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <hr className="my-1 border-slate-700" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <RoleBadge role={user.role} />
        <StatusBadge isActive={user.isActive} />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-500">Organization</span>
          <p className="text-slate-300 flex items-center gap-1 mt-1">
            <Building2 className="w-3 h-3" />
            {user.organizationId}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Created</span>
          <p className="text-slate-300 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
  availableRoles,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => void;
  organizationId: string;
  availableRoles: Role[];
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: "",
    password: "",
    displayName: "",
    role: "dispatcher",
    organizationId: organizationId,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.displayName || formData.displayName.trim().length < 2) {
      newErrors.displayName = "Display name is required";
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: "",
        password: "",
        displayName: "",
        role: "dispatcher",
        organizationId: organizationId,
      });
      setErrors({});
    }
  }, [isOpen, organizationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Create New User
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                errors.displayName ? "border-red-500" : "border-slate-700"
              }`}
              placeholder="John Doe"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-400">{errors.displayName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                errors.email ? "border-red-500" : "border-slate-700"
              }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full px-4 py-2.5 pr-10 bg-slate-900 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                  errors.password ? "border-red-500" : "border-slate-700"
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
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.filter((r) => availableRoles.includes(r.value)).map(
                (role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: role.value })
                    }
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors text-left ${
                      formData.role === role.value
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-slate-900 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        formData.role === role.value
                          ? "border-amber-500"
                          : "border-slate-600"
                      }`}
                    >
                      {formData.role === role.value && (
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {role.label}
                      </div>
                      <div className="text-xs text-slate-400">
                        {role.description}
                      </div>
                    </div>
                  </button>
                ),
              )}
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
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  currentUserRole,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditUserFormData) => void;
  user: UserData | null;
  currentUserRole: Role;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<EditUserFormData>({
    uid: "",
    displayName: "",
    email: "",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-amber-400" />
            Edit User
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Email (Read-only for now) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">
              Email cannot be changed
            </p>
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
                <UserCheck className="w-4 h-4" />
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
                <UserX className="w-4 h-4" />
                Inactive
              </button>
            </div>
          </div>

          {/* Role Info */}
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Current Role</span>
              <RoleBadge role={user.role} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              To change a user's role, use the "Assign Role" function.
            </p>
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

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserData | null;
  isLoading: boolean;
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete User?
          </h3>
          <p className="text-slate-400 mb-1">
            Are you sure you want to delete{" "}
            <span className="text-white font-medium">{user.displayName}</span>?
          </p>
          <p className="text-sm text-slate-500">
            This will deactivate the user account. This action can be reversed
            by an administrator.
          </p>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
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
                Delete User
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

export default function UserManagementPage() {
  const { user: authUser, role } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Determine current user's role
  const currentUserRole: Role =
    role === "superadmin" ? "saas_admin" : (role as Role) || "dispatcher";

  // Get available roles that current user can assign
  const availableRoles = useMemo(() => {
    if (currentUserRole === "saas_admin") {
      return ROLES.map((r) => r.value);
    }
    const currentLevel = ROLE_HIERARCHY[currentUserRole] || 0;
    return ROLES.filter((r) => ROLE_HIERARCHY[r.value] < currentLevel).map(
      (r) => r.value,
    );
  }, [currentUserRole]);

  // Load users
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const getUsersByOrganization = httpsCallable<
        { organizationId?: string; includeInactive?: boolean },
        { users: UserData[]; count: number }
      >(functions, "getUsersByOrganization");

      const result = await getUsersByOrganization({
        includeInactive: true,
      });

      setUsers(result.data.users);
    } catch (err: unknown) {
      console.error("Error loading users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !user.displayName?.toLowerCase().includes(query) &&
          !user.email?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !user.isActive) {
        return false;
      }
      if (statusFilter === "inactive" && user.isActive) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Create user
  const handleCreateUser = async (data: CreateUserFormData) => {
    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const createUser = httpsCallable(functions, "createUser");

      await createUser(data);

      setShowCreateModal(false);
      setSuccessMessage("User created successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      loadUsers();
    } catch (err: unknown) {
      console.error("Error creating user:", err);
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (data: EditUserFormData) => {
    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const updateUser = httpsCallable(functions, "updateUser");

      await updateUser(data);

      setShowEditModal(false);
      setSelectedUser(null);
      setSuccessMessage("User updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      loadUsers();
    } catch (err: unknown) {
      console.error("Error updating user:", err);
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const deleteUser = httpsCallable(functions, "deleteUser");

      await deleteUser({ uid: selectedUser.uid });

      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccessMessage("User deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      loadUsers();
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user: UserData) => {
    setIsActionLoading(true);
    setError(null);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const updateUser = httpsCallable(functions, "updateUser");

      await updateUser({
        uid: user.uid,
        isActive: !user.isActive,
      });

      setSuccessMessage(
        `User ${user.isActive ? "deactivated" : "activated"} successfully`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      loadUsers();
    } catch (err: unknown) {
      console.error("Error toggling user status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update user status",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Check if user has permission to manage users
  const canManageUsers =
    role === "admin" ||
    role === "superadmin" ||
    currentUserRole === "saas_admin";

  if (!canManageUsers) {
    return (
      <div className="p-6 bg-slate-950 min-h-screen">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center p-8">
            <div className="p-4 rounded-2xl bg-red-500/10 mb-6 inline-block">
              <Shield className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Access Denied
            </h2>
            <p className="text-slate-400 max-w-md">
              You do not have permission to manage users. This feature is only
              available to administrators.
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
            User Management
          </h1>
          <p className="text-slate-400">
            Manage users, roles, and permissions for your organization
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-xl text-sm font-medium text-slate-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
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
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-sm text-slate-400">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {users.filter((u) => u.isActive).length}
              </p>
              <p className="text-sm text-slate-400">Active Users</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {users.filter((u) => !u.isActive).length}
              </p>
              <p className="text-sm text-slate-400">Inactive Users</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {users.filter((u) => u.role === "admin").length}
              </p>
              <p className="text-sm text-slate-400">Administrators</p>
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
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Roles</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
            onClick={loadUsers}
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

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Users className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No users found
          </h3>
          <p className="text-slate-400 max-w-md">
            {searchQuery || roleFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first user"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.uid}
              user={user}
              currentUserRole={currentUserRole}
              onEdit={() => {
                setSelectedUser(user);
                setShowEditModal(true);
              }}
              onDelete={() => {
                setSelectedUser(user);
                setShowDeleteModal(true);
              }}
              onToggleStatus={() => handleToggleStatus(user)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        organizationId={authUser?.org || "royalcarriage"}
        availableRoles={availableRoles}
        isLoading={isActionLoading}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
        currentUserRole={currentUserRole}
        isLoading={isActionLoading}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        user={selectedUser}
        isLoading={isActionLoading}
      />
    </div>
  );
}
