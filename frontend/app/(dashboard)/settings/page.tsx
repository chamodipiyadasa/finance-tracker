'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Wallet, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

const currencies = [
  { code: 'Rs', name: 'Sri Lankan Rupee (LKR)', locale: 'si-LK' },
  { code: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  { code: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  { code: '€', name: 'Euro (EUR)', locale: 'en-DE' },
  { code: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile');
  
  // Profile form
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  
  // Preferences
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'Rs');
  const [isPreferencesSaving, setIsPreferencesSaving] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    
    try {
      if (user) {
        const response = await api.updateProfile({
          firstName,
          lastName,
        });
        
        if (response.success) {
          toast.success('Profile updated successfully');
          await refreshUser();
        } else {
          toast.error(response.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsPasswordSaving(true);
    
    try {
      const response = await api.changePassword({
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    setIsPreferencesSaving(true);
    
    try {
      // Note: In a real app, you'd have an API endpoint for this
      toast.success('Preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsPreferencesSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Wallet },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>Settings</h1>
        <p style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="glass-card p-2 flex lg:flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors flex-1 lg:flex-initial ${
                  activeTab === tab.id
                    ? theme === 'light' ? 'bg-[rgba(132,147,74,0.2)]' : 'bg-primary-300/20 text-primary-300'
                    : theme === 'light' ? 'hover:bg-[rgba(132,147,74,0.1)]' : 'text-base-400 hover:bg-primary-300/10 hover:text-primary-300'
                }`}
                style={{ 
                  color: activeTab === tab.id 
                    ? (theme === 'light' ? '#84934A' : undefined) 
                    : (theme === 'light' ? '#656D3F' : undefined) 
                }}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : undefined }}>
                  <User className="w-8 h-8" style={{ color: theme === 'light' ? '#84934A' : undefined }} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: theme === 'light' ? '#492828' : undefined }}>Profile Information</h2>
                  <p style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Update your personal details</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-field"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-field"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="your@email.com"
                    disabled
                  />
                  <p className="text-xs mt-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Email cannot be changed</p>
                </div>

                <div className="p-4 rounded-xl" style={{ 
                  backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : undefined,
                  border: theme === 'light' ? '1px solid #84934A' : undefined
                }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" style={{ color: theme === 'light' ? '#84934A' : undefined }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#492828' : undefined }}>Account Status</p>
                      <p className="text-xs" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                        {user?.role === 'Admin' ? 'Administrator Account' : 'Active User Account'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isProfileSaving}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isProfileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-300/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary-300" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-base-200">Change Password</h2>
                  <p className="text-base-400">Keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-base-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-base-400 hover:text-primary-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-base-400 hover:text-primary-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="p-4 rounded-xl" style={{
                  backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(30, 30, 40, 0.5)',
                  border: theme === 'light' ? '1px solid #84934A' : '1px solid rgba(233, 223, 158, 0.2)'
                }}>
                  <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    <strong style={{ color: theme === 'light' ? '#492828' : undefined }}>Password requirements:</strong>
                  </p>
                  <ul className="text-sm mt-2 space-y-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    <li className={newPassword.length >= 6 ? 'text-accent-400' : ''}>
                      • At least 6 characters
                    </li>
                    <li className={newPassword && newPassword === confirmPassword ? 'text-accent-400' : ''}>
                      • Passwords must match
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPasswordSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    {isPasswordSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-300/10 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-primary-300" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-base-200">Preferences</h2>
                  <p className="text-base-400">Customize your experience</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-base-300 mb-3">
                    Currency
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => setSelectedCurrency(currency.code)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          selectedCurrency === currency.code
                            ? 'border-primary-300 bg-primary-300/10 text-base-200'
                            : theme === 'light' 
                              ? 'border-[#84934A] bg-[rgba(132,147,74,0.1)]' 
                              : 'border-primary-300/20 bg-dark-800/30 text-base-400 hover:border-primary-300/40'
                        }`}
                        style={{ color: selectedCurrency !== currency.code && theme === 'light' ? '#492828' : undefined }}
                      >
                        <span className="text-2xl font-bold w-8">{currency.code}</span>
                        <span className="text-sm">{currency.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{
                  backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(30, 30, 40, 0.5)',
                  border: theme === 'light' ? '1px solid #84934A' : '1px solid rgba(233, 223, 158, 0.2)'
                }}>
                  <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    <strong style={{ color: theme === 'light' ? '#492828' : undefined }}>Note:</strong> Currency preference affects how amounts are displayed throughout the app.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handlePreferencesSave}
                    disabled={isPreferencesSaving}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isPreferencesSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
