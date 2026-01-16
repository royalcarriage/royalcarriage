import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, UserRole } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface UserRecord {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  lastLogin: string;
}

export default function UsersPage() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserRecord[];
      setUsers(usersList);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess(`Role updated successfully for user ${userId}`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh users list
      await fetchUsers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError('Failed to update role. Please try again.');
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-purple-600 text-white';
      case UserRole.ADMIN:
        return 'bg-blue-600 text-white';
      case UserRole.EDITOR:
        return 'bg-green-600 text-white';
      case UserRole.VIEWER:
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const canEditUser = (user: UserRecord): boolean => {
    // SuperAdmin can edit anyone
    if (userData?.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    // Admin can edit Editor and Viewer
    if (userData?.role === UserRole.ADMIN) {
      return user.role === UserRole.EDITOR || user.role === UserRole.VIEWER;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions for the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.displayName || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {canEditUser(user) ? (
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.uid, value as UserRole)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {userData?.role === UserRole.SUPER_ADMIN && (
                                <SelectItem value={UserRole.SUPER_ADMIN}>SuperAdmin</SelectItem>
                              )}
                              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                              <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                              <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-gray-500">No permission</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Role Permissions</h3>
            <ul className="text-sm space-y-1">
              <li><Badge className="bg-purple-600">SuperAdmin</Badge>: Full access to all features including user management</li>
              <li><Badge className="bg-blue-600">Admin</Badge>: Can manage content, CSV imports, and view analytics</li>
              <li><Badge className="bg-green-600">Editor</Badge>: Can edit content and view reports</li>
              <li><Badge className="bg-gray-600">Viewer</Badge>: Read-only access to dashboards</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
