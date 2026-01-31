'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Plus, Edit2, Trash2, Shield, User, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Eye, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { User as UserType, CreateUserRequest } from '@/types';
import { format } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminUsersPage() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formUsername, setFormUsername] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'Admin' | 'User'>('User');
  const [formCurrency, setFormCurrency] = useState('Rs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery]);

  const loadUsers = async () => {
    try {
      const response = await api.getUsers({
        page: currentPage,
        pageSize: 10,
        search: searchQuery || undefined,
      });

      if (response.success && response.data) {
        setUsers(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormUsername('');
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('User');
    setFormCurrency('Rs');
    setShowModal(true);
  };

  const handleOpenEdit = (user: UserType) => {
    setSelectedUser(user);
    setFormUsername(user.username);
    setFormFirstName(user.firstName);
    setFormLastName(user.lastName);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormCurrency(user.currency);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedUser) {
        // Update user
        const response = await api.updateUser(selectedUser.id, {
          email: formEmail,
          firstName: formFirstName,
          lastName: formLastName,
          currency: formCurrency,
        });

        if (response.success) {
          toast.success('User updated successfully');
          setShowModal(false);
          loadUsers();
        }
      } else {
        // Create user
        const response = await api.createUser({
          username: formUsername,
          email: formEmail,
          password: formPassword,
          firstName: formFirstName,
          lastName: formLastName,
          role: formRole,
          currency: formCurrency,
        });

        if (response.success) {
          toast.success('User created successfully');
          setShowModal(false);
          loadUsers();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: UserType) => {
    try {
      const response = await api.toggleUserStatus(user.id);

      if (response.success) {
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
        loadUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        setShowDeleteConfirm(null);
        loadUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme === 'light' ? '#492828' : 'white' }}>Users</h1>
          <p style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>Manage user accounts</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search users by name or email..."
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 skeleton" />
              ))}
            </div>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: theme === 'light' ? '#656D3F' : '#4b5563' }} />
            <p style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(30, 30, 40, 0.5)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme === 'light' ? '#492828' : '#6b7280' }}>User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme === 'light' ? '#492828' : '#6b7280' }}>Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme === 'light' ? '#492828' : '#6b7280' }}>Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme === 'light' ? '#492828' : '#6b7280' }}>Joined</th>
                    <th className="px-6 py-4 text-right text-sm font-medium" style={{ color: theme === 'light' ? '#492828' : '#6b7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: theme === 'light' ? '#84934A' : '#374151' }}>
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors" style={{ backgroundColor: 'transparent' }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ 
                              backgroundColor: user.role === 'Admin' 
                                ? (theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : 'rgba(233, 223, 158, 0.2)') 
                                : (theme === 'light' ? 'rgba(73, 40, 40, 0.1)' : '#374151')
                            }}
                          >
                            {user.role === 'Admin' ? (
                              <Shield className="w-5 h-5" style={{ color: theme === 'light' ? '#84934A' : '#e9df9e' }} />
                            ) : (
                              <User className="w-5 h-5" style={{ color: theme === 'light' ? '#492828' : '#6b7280' }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: theme === 'light' ? '#492828' : 'white' }}>{user.firstName} {user.lastName}</p>
                            <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: user.role === 'Admin' 
                              ? (theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : 'rgba(233, 223, 158, 0.2)')
                              : (theme === 'light' ? 'rgba(73, 40, 40, 0.1)' : '#374151'),
                            color: user.role === 'Admin'
                              ? (theme === 'light' ? '#84934A' : '#e9df9e')
                              : (theme === 'light' ? '#492828' : '#9ca3af')
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.isActive
                              ? 'bg-accent-500/20 text-accent-400 hover:bg-accent-500/30'
                              : 'bg-danger-500/20 text-danger-400 hover:bg-danger-500/30'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: theme === 'light' ? '#492828' : '#6b7280' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-dark-700">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'Admin' ? 'bg-primary-500/20' : 'bg-dark-700'
                      }`}>
                        {user.role === 'Admin' ? (
                          <Shield className="w-5 h-5 text-primary-400" />
                        ) : (
                          <User className="w-5 h-5 text-dark-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: theme === 'light' ? '#492828' : 'white' }}>{user.firstName} {user.lastName}</p>
                        <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 hover:bg-dark-700 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4 text-dark-400" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="p-2 hover:bg-danger-500/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-danger-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      user.role === 'Admin'
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-dark-700 text-dark-300'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      user.isActive
                        ? 'bg-accent-500/20 text-accent-400'
                        : 'bg-danger-500/20 text-danger-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700">
                <p className="text-sm text-dark-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-dark-700 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-dark-700 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {selectedUser ? 'Edit User' : 'Create User'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-dark-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!selectedUser && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : '#9ca3af' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="input-field"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : '#9ca3af' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="input-field"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : '#9ca3af' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="input-field"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : '#9ca3af' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="input-field"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : '#9ca3af' }}>
                    Password {selectedUser && <span style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>(leave empty to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    required={!selectedUser}
                    minLength={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Role
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as 'Admin' | 'User')}
                      className="input-field"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      className="input-field"
                    >
                      <option value="Rs">Rs LKR</option>
                      <option value="₹">₹ INR</option>
                      <option value="$">$ USD</option>
                      <option value="€">€ EUR</option>
                      <option value="£">£ GBP</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : selectedUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-danger-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-danger-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete User?</h3>
              <p className="text-dark-400 mb-6">
                This action cannot be undone. All user data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-danger-500 hover:bg-danger-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
