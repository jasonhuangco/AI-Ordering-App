'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../../components/AdminNav'
import { useBranding } from '../../../components/BrandingProvider'

interface ReminderSettings {
  id: string
  dayOfWeek: number
  hour: number
  timezone: string
  isActive: boolean
  emailEnabled: boolean
  smsEnabled: boolean
}

interface BrandingSettings {
  companyName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logoText: string
  tagline: string
  fontFamily: string
  theme: 'light' | 'dark'
  backgroundColor?: string
  buttonColor?: string
  logoUrl?: string | null
}

interface AdminUser {
  id: string
  email: string
  role: string
  isActive: boolean
  companyName?: string
  contactName?: string
  createdAt: string
  updatedAt: string
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' }
]

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { branding, updateBranding, refreshBranding } = useBranding()
  const [settings, setSettings] = useState<ReminderSettings | null>(null)
  const [localBranding, setLocalBranding] = useState(branding)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    contactName: '',
    companyName: '',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'reminders' | 'branding' | 'homepage' | 'users'>('reminders')

  // Sync local branding state with context
  useEffect(() => {
    setLocalBranding(branding)
  }, [branding])

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchSettings()
    fetchBrandingSettings()
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [session, status, router, activeTab])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/reminder-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        console.error('Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBrandingSettings = async () => {
    try {
      await refreshBranding()
    } catch (error) {
      console.error('Error fetching branding settings:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const updateSettings = (field: keyof ReminderSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value })
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/reminder-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  const saveBrandingSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/branding-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localBranding),
      })

      if (response.ok) {
        const result = await response.json()
        // Update local state
        updateBranding(result.settings)
        setLocalBranding(result.settings)
        // Force refresh from server to ensure consistency
        await refreshBranding()
        alert('Branding settings saved successfully! ✨')
      } else {
        const errorData = await response.json()
        alert(`Failed to save branding settings: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving branding settings:', error)
      alert('Error saving branding settings')
    } finally {
      setIsSaving(false)
    }
  }

  const resetBrandingToDefaults = () => {
    const defaultBranding = {
      companyName: 'Roaster Ordering',
      primaryColor: '#8B4513',
      secondaryColor: '#D2B48C',
      accentColor: '#DAA520',
      backgroundColor: '#F5F5DC',
      buttonColor: '#8B4513',
      logoText: 'Roaster Ordering',
      logoUrl: null,
      tagline: 'Premium Wholesale Coffee',
      fontFamily: 'Inter',
      theme: 'light' as const
    }
    
    if (confirm('Are you sure you want to reset all branding settings to defaults? This will overwrite all current customizations.')) {
      setLocalBranding(defaultBranding)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    try {
      const response = await fetch('/api/admin/logo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        await refreshBranding()
        alert('Logo uploaded successfully! ✨')
      } else {
        const errorData = await response.json()
        alert(`Failed to upload logo: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error uploading logo')
    }
  }

  const removeLogo = async () => {
    if (!confirm('Are you sure you want to remove the logo?')) return

    try {
      const response = await fetch('/api/admin/logo', {
        method: 'DELETE',
      })

      if (response.ok) {
        await refreshBranding()
        alert('Logo removed successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to remove logo: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error removing logo:', error)
      alert('Error removing logo')
    }
  }

  const handleCreateUser = async () => {
    if (!userFormData.email || !userFormData.password) {
      alert('Email and password are required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userFormData,
          role: 'ADMIN'
        }),
      })

      if (response.ok) {
        alert('Admin user created successfully!')
        setShowUserModal(false)
        resetUserForm()
        fetchUsers()
      } else {
        const errorData = await response.json()
        alert(`Failed to create user: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    setIsSaving(true)
    try {
      const updateData: any = {
        email: userFormData.email,
        contactName: userFormData.contactName,
        companyName: userFormData.companyName,
        isActive: userFormData.isActive
      }

      if (userFormData.password) {
        updateData.password = userFormData.password
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        alert('User updated successfully!')
        setShowUserModal(false)
        setEditingUser(null)
        resetUserForm()
        fetchUsers()
      } else {
        const errorData = await response.json()
        alert(`Failed to update user: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('User deleted successfully!')
        fetchUsers()
      } else {
        const errorData = await response.json()
        alert(`Failed to delete user: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    } finally {
      setIsSaving(false)
    }
  }

  const openUserModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        email: user.email,
        password: '',
        contactName: user.contactName || '',
        companyName: user.companyName || '',
        isActive: user.isActive
      })
    } else {
      setEditingUser(null)
      resetUserForm()
    }
    setShowUserModal(true)
  }

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      password: '',
      contactName: '',
      companyName: '',
      isActive: true
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-coffee-light/20 to-warm-gold/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coffee-brown"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav currentPage="/admin/settings" />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-serif font-bold text-coffee-dark">System Settings</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-coffee-light/20 shadow-2xl p-8">
          {/* Tab Navigation */}
          <div className="border-b border-coffee-light/30 mb-6">
            <nav className="-mb-px overflow-x-auto" aria-label="Tabs">
              <div className="flex space-x-1 sm:space-x-8 min-w-max sm:min-w-0 pb-1">
                {[
                  { id: 'reminders', name: 'Order Reminders', shortName: 'Reminders', icon: '🔔' },
                  { id: 'branding', name: 'Appearance & Branding', shortName: 'Branding', icon: '🎨' },
                  { id: 'homepage', name: 'Homepage Content', shortName: 'Homepage', icon: '🏠' },
                  { id: 'users', name: 'Admin Users', shortName: 'Users', icon: '👥' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-warm-gold text-warm-gold'
                        : 'border-transparent text-coffee-dark hover:text-warm-gold hover:border-warm-gold/50'
                    } whitespace-nowrap py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0`}
                  >
                    <span className="text-lg sm:text-base">{tab.icon}</span>
                    <span className="text-xs sm:text-sm sm:hidden">{tab.shortName}</span>
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'reminders' && settings && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-coffee-dark font-montserrat">Weekly Order Reminders</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Day Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-coffee-dark">
                    Reminder Day
                  </label>
                  <select
                    value={settings.dayOfWeek}
                    onChange={(e) => updateSettings('dayOfWeek', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-coffee-dark">
                    Reminder Time
                  </label>
                  <select
                    value={settings.hour}
                    onChange={(e) => updateSettings('hour', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timezone Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-coffee-dark">
                    Time Zone
                  </label>
                  <select
                    value={settings.timezone || 'America/Los_Angeles'}
                    onChange={(e) => updateSettings('timezone', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-coffee-dark">
                    Reminder Status
                  </label>
                  <button
                    onClick={() => updateSettings('isActive', !settings.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-warm-gold focus:ring-offset-2 ${
                      settings.isActive ? 'bg-warm-gold' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <p className="text-sm text-coffee-dark/70">
                    {settings.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                {/* Notification Channels */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-coffee-dark">
                    Notification Channels
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.emailEnabled}
                        onChange={(e) => updateSettings('emailEnabled', e.target.checked)}
                        className="rounded border-coffee-light/30 text-warm-gold focus:ring-warm-gold"
                      />
                      <span className="ml-2 text-sm text-coffee-dark">Email Notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.smsEnabled}
                        onChange={(e) => updateSettings('smsEnabled', e.target.checked)}
                        className="rounded border-coffee-light/30 text-warm-gold focus:ring-warm-gold"
                      />
                      <span className="ml-2 text-sm text-coffee-dark">SMS Notifications</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-coffee-brown to-coffee-dark text-white font-medium rounded-lg hover:from-coffee-dark hover:to-espresso transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Reminder Settings
                  </>
                )}
              </button>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-coffee-dark font-montserrat">Appearance & Branding</h2>
              
              {/* Company Information */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={localBranding.companyName}
                      onChange={(e) => setLocalBranding({...localBranding, companyName: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Logo Text
                    </label>
                    <input
                      type="text"
                      value={localBranding.logoText}
                      onChange={(e) => setLocalBranding({...localBranding, logoText: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Logo Text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={localBranding.tagline}
                      onChange={(e) => setLocalBranding({...localBranding, tagline: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Company tagline or slogan"
                    />
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Color Scheme</h3>
                
                {/* Preset Color Schemes */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-coffee-dark mb-3">Quick Presets</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        name: 'Classic Coffee',
                        primary: '#8B4513',
                        secondary: '#D2B48C',
                        accent: '#DAA520'
                      },
                      {
                        name: 'Dark Roast',
                        primary: '#4A2C17',
                        secondary: '#8B4513',
                        accent: '#CD853F'
                      },
                      {
                        name: 'Modern Blue',
                        primary: '#2563EB',
                        secondary: '#60A5FA',
                        accent: '#F59E0B'
                      },
                      {
                        name: 'Forest Green',
                        primary: '#059669',
                        secondary: '#6EE7B7',
                        accent: '#F59E0B'
                      }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setLocalBranding({
                          ...localBranding,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent
                        })}
                        className="p-3 rounded-lg border border-coffee-light/30 hover:border-warm-gold/50 transition-all duration-200 bg-white/30 backdrop-blur-sm group"
                      >
                        <div className="flex gap-1 mb-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: preset.primary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: preset.secondary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: preset.accent }}
                          ></div>
                        </div>
                        <div className="text-xs text-coffee-dark group-hover:text-warm-gold transition-colors">
                          {preset.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localBranding.primaryColor}
                        onChange={(e) => setLocalBranding({...localBranding, primaryColor: e.target.value})}
                        className="w-12 h-12 rounded-lg border border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localBranding.primaryColor}
                        onChange={(e) => setLocalBranding({...localBranding, primaryColor: e.target.value})}
                        className="flex-1 px-3 py-2 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="#8B4513"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localBranding.secondaryColor}
                        onChange={(e) => setLocalBranding({...localBranding, secondaryColor: e.target.value})}
                        className="w-12 h-12 rounded-lg border border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localBranding.secondaryColor}
                        onChange={(e) => setLocalBranding({...localBranding, secondaryColor: e.target.value})}
                        className="flex-1 px-3 py-2 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="#D2B48C"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localBranding.accentColor}
                        onChange={(e) => setLocalBranding({...localBranding, accentColor: e.target.value})}
                        className="w-12 h-12 rounded-lg border border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localBranding.accentColor}
                        onChange={(e) => setLocalBranding({...localBranding, accentColor: e.target.value})}
                        className="flex-1 px-3 py-2 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="#DAA520"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Color Preview */}
                <div className="mt-4 p-4 rounded-lg bg-white/20 border border-coffee-light/20">
                  <h4 className="text-sm font-medium text-coffee-dark mb-3">Color Preview</h4>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: localBranding.primaryColor }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: localBranding.secondaryColor }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: localBranding.accentColor }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Accent</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: localBranding.backgroundColor || '#F5F5DC' }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Background</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: localBranding.buttonColor || '#8B4513' }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Button</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background & Button Colors */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Background & Button Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={localBranding.backgroundColor || '#F5F5DC'}
                        onChange={(e) => setLocalBranding({...localBranding, backgroundColor: e.target.value})}
                        className="w-16 h-12 rounded-lg border-2 border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localBranding.backgroundColor || '#F5F5DC'}
                        onChange={(e) => setLocalBranding({...localBranding, backgroundColor: e.target.value})}
                        className="flex-1 px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="#F5F5DC"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Button Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={localBranding.buttonColor || '#8B4513'}
                        onChange={(e) => setLocalBranding({...localBranding, buttonColor: e.target.value})}
                        className="w-16 h-12 rounded-lg border-2 border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localBranding.buttonColor || '#8B4513'}
                        onChange={(e) => setLocalBranding({...localBranding, buttonColor: e.target.value})}
                        className="flex-1 px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="#8B4513"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Logo Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Company Logo (appears on login page)
                    </label>
                    <div className="flex items-center gap-4">
                      {branding.logoUrl ? (
                        <div className="flex items-center gap-4">
                          <img 
                            src={branding.logoUrl} 
                            alt="Company Logo" 
                            className="w-16 h-16 object-contain rounded-lg border border-coffee-light/30"
                          />
                          <button
                            onClick={removeLogo}
                            className="px-3 py-1 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Remove Logo
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 border-2 border-dashed border-coffee-light/40 rounded-lg flex items-center justify-center">
                          <span className="text-coffee-light/60 text-sm">No logo</span>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark cursor-pointer transition-colors inline-flex items-center gap-2"
                        >
                          📁 Choose Logo
                        </label>
                      </div>
                    </div>
                    <p className="text-sm text-coffee-dark/60 mt-2">
                      Recommended: PNG or JPG, maximum 5MB. Logo will be resized automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Font Family
                    </label>
                    <select
                      value={localBranding.fontFamily}
                      onChange={(e) => setLocalBranding({...localBranding, fontFamily: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="Inter">Inter (Modern Sans-serif)</option>
                      <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                      <option value="Montserrat">Montserrat (Clean Sans-serif)</option>
                      <option value="Open Sans">Open Sans (Readable Sans-serif)</option>
                      <option value="Dancing Script">Dancing Script (Script)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Theme Mode
                    </label>
                    <select
                      value={localBranding.theme}
                      onChange={(e) => setLocalBranding({...localBranding, theme: e.target.value as 'light' | 'dark'})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="light">Light Theme</option>
                      <option value="dark">Dark Theme</option>
                    </select>
                  </div>
                </div>
                
                {/* Font Preview */}
                <div className="mt-4 p-4 rounded-lg bg-white/20 border border-coffee-light/20">
                  <h4 className="text-sm font-medium text-coffee-dark mb-3">Font Preview</h4>
                  <div 
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: localBranding.fontFamily }}
                  >
                    {localBranding.companyName || 'Your Company Name'}
                  </div>
                  <div 
                    className="text-sm text-coffee-dark/70"
                    style={{ fontFamily: localBranding.fontFamily }}
                  >
                    {localBranding.tagline || 'Your company tagline appears here'}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetBrandingToDefaults}
                  className="px-6 py-3 text-coffee-dark font-medium rounded-lg border border-coffee-light/30 hover:bg-coffee-light/10 transition-all duration-200 flex items-center gap-2"
                >
                  <span>🔄</span>
                  Reset to Defaults
                </button>
                
                <button
                  onClick={saveBrandingSettings}
                  disabled={isSaving}
                  className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: localBranding.buttonColor || '#8B4513' }}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Applying Changes...
                    </>
                  ) : (
                    <>
                      <span>🎨</span>
                      Apply Branding Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Homepage Tab */}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-coffee-dark font-montserrat">Homepage Content</h2>
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark transition-colors flex items-center gap-2"
                >
                  👁️ Preview Homepage
                </button>
              </div>

              {/* Hero Section */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={localBranding.heroTitle || ''}
                      onChange={(e) => setLocalBranding({...localBranding, heroTitle: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Wholesale Coffee Ordering"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={localBranding.heroSubtitle || ''}
                      onChange={(e) => setLocalBranding({...localBranding, heroSubtitle: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Made Simple"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-dark mb-2">
                    Hero Description
                  </label>
                  <textarea
                    value={localBranding.heroDescription || ''}
                    onChange={(e) => setLocalBranding({...localBranding, heroDescription: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Streamline your weekly coffee orders with our intuitive platform..."
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={localBranding.contactEmail || ''}
                      onChange={(e) => setLocalBranding({...localBranding, contactEmail: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="support@roasterordering.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={localBranding.contactPhone || ''}
                      onChange={(e) => setLocalBranding({...localBranding, contactPhone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="1-800-ROASTER"
                    />
                  </div>
                </div>
              </div>

              {/* Page Sections */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Page Sections</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-coffee-dark">Features Section</h4>
                      <p className="text-sm text-coffee-dark/60">Show the three feature cards (Premium Selection, Mobile Friendly, Smart Reminders)</p>
                    </div>
                    <button
                      onClick={() => setLocalBranding({...localBranding, showFeatures: !(localBranding.showFeatures ?? true)})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-warm-gold focus:ring-offset-2 ${
                        (localBranding.showFeatures ?? true) ? 'bg-warm-gold' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (localBranding.showFeatures ?? true) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-coffee-dark">Statistics Section</h4>
                      <p className="text-sm text-coffee-dark/60">Show the stats section (25+ Accounts, 100+ Orders, 99% On-Time)</p>
                    </div>
                    <button
                      onClick={() => setLocalBranding({...localBranding, showStats: !(localBranding.showStats ?? true)})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-warm-gold focus:ring-offset-2 ${
                        (localBranding.showStats ?? true) ? 'bg-warm-gold' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (localBranding.showStats ?? true) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={saveBrandingSettings}
                disabled={isSaving}
                className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: localBranding.buttonColor || '#8B4513' }}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span>🏠</span>
                    Save Homepage Changes
                  </>
                )}
              </button>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-coffee-dark font-montserrat">Admin Users</h2>
                <button
                  onClick={() => openUserModal()}
                  className="px-4 py-2 bg-gradient-to-r from-coffee-brown to-coffee-dark text-white font-medium rounded-lg hover:from-coffee-dark hover:to-espresso transition-all duration-200 flex items-center gap-2"
                >
                  <span>+</span>
                  Add New Admin
                </button>
              </div>

              {/* Users List */}
              <div className="bg-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-coffee-brown/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-coffee-dark uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-light/20">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-coffee-light/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-dark">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-dark">{user.contactName || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-dark">{user.companyName || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-dark">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openUserModal(user)}
                              className="text-warm-gold hover:text-coffee-brown mr-3 transition-colors"
                            >
                              Edit
                            </button>
                            {user.id !== session?.user.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-coffee-dark/50">
                            No admin users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-coffee-dark mb-4">
              {editingUser ? 'Edit Admin User' : 'Create New Admin User'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-coffee-light/30 rounded-lg focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20"
                  placeholder="admin@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-1">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-coffee-light/30 rounded-lg focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={userFormData.contactName}
                  onChange={(e) => setUserFormData({...userFormData, contactName: e.target.value})}
                  className="w-full px-3 py-2 border border-coffee-light/30 rounded-lg focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={userFormData.companyName}
                  onChange={(e) => setUserFormData({...userFormData, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-coffee-light/30 rounded-lg focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20"
                  placeholder="Company Inc."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={userFormData.isActive}
                  onChange={(e) => setUserFormData({...userFormData, isActive: e.target.checked})}
                  className="rounded border-coffee-light/30 text-warm-gold focus:ring-warm-gold"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-coffee-dark">
                  Active User
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false)
                  setEditingUser(null)
                  resetUserForm()
                }}
                className="px-4 py-2 text-coffee-dark border border-coffee-light/30 rounded-lg hover:bg-coffee-light/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-coffee-brown to-coffee-dark text-white rounded-lg hover:from-coffee-dark hover:to-espresso transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
