'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ReminderSettings {
  id: string
  dayOfWeek: number
  hour: number
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
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<ReminderSettings | null>(null)
  const [branding, setBranding] = useState<BrandingSettings>({
    companyName: 'Roaster Ordering',
    primaryColor: '#8B4513',
    secondaryColor: '#D2B48C',
    accentColor: '#DAA520',
    logoText: 'Roaster Ordering',
    tagline: 'Premium Wholesale Coffee',
    fontFamily: 'Inter',
    theme: 'light'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'reminders' | 'branding' | 'system'>('reminders')

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchSettings()
  }, [session, status, router])

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
      // TODO: Implement branding settings API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Branding settings saved! (Demo)')
    } catch (error) {
      console.error('Error saving branding settings:', error)
      alert('Error saving branding settings')
    } finally {
      setIsSaving(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-cream via-coffee-light/20 to-warm-gold/30">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-coffee-light/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard" 
                className="text-coffee-dark hover:text-warm-gold transition-colors duration-200 flex items-center gap-2"
              >
                <span>←</span>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-coffee-dark font-playfair">System Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-coffee-light/20 shadow-2xl p-8">
          {/* Tab Navigation */}
          <div className="border-b border-coffee-light/30 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'reminders', name: 'Order Reminders', icon: '🔔' },
                { id: 'branding', name: 'Appearance & Branding', icon: '🎨' },
                { id: 'system', name: 'System Status', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-warm-gold text-warm-gold'
                      : 'border-transparent text-coffee-dark hover:text-warm-gold hover:border-warm-gold/50'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
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
                      value={branding.companyName}
                      onChange={(e) => setBranding({...branding, companyName: e.target.value})}
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
                      value={branding.logoText}
                      onChange={(e) => setBranding({...branding, logoText: e.target.value})}
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
                      value={branding.tagline}
                      onChange={(e) => setBranding({...branding, tagline: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Company tagline or slogan"
                    />
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-coffee-dark">Color Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                        className="w-12 h-12 rounded-lg border border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
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
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                        className="w-12 h-12 rounded-lg border border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
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
                        value={branding.accentColor}
                        onChange={(e) => setBranding({...branding, accentColor: e.target.value})}
                        className="w-12 h-12 rounded-lg border border-coffee-light/30 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({...branding, accentColor: e.target.value})}
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
                        style={{ backgroundColor: branding.primaryColor }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: branding.secondaryColor }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: branding.accentColor }}
                      ></div>
                      <span className="text-xs text-coffee-dark">Accent</span>
                    </div>
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
                      value={branding.fontFamily}
                      onChange={(e) => setBranding({...branding, fontFamily: e.target.value})}
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
                      value={branding.theme}
                      onChange={(e) => setBranding({...branding, theme: e.target.value as 'light' | 'dark'})}
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
                    style={{ fontFamily: branding.fontFamily }}
                  >
                    {branding.companyName || 'Your Company Name'}
                  </div>
                  <div 
                    className="text-sm text-coffee-dark/70"
                    style={{ fontFamily: branding.fontFamily }}
                  >
                    {branding.tagline || 'Your company tagline appears here'}
                  </div>
                </div>
              </div>

              <button
                onClick={saveBrandingSettings}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-warm-gold to-coffee-brown text-white font-medium rounded-lg hover:from-coffee-brown hover:to-coffee-dark transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
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
          )}

          {/* System Status Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-coffee-dark font-montserrat">System Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Database Status */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-coffee-dark">Database</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-coffee-dark/70">Connected</p>
                </div>

                {/* Email Service */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-coffee-dark">Email Service</span>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-coffee-dark/70">Not Configured</p>
                </div>

                {/* SMS Service */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-coffee-dark">SMS Service</span>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-coffee-dark/70">Not Configured</p>
                </div>

                {/* Reminder Service */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-coffee-dark">Reminders</span>
                    <div className={`w-3 h-3 ${settings?.isActive ? 'bg-green-500' : 'bg-gray-400'} rounded-full`}></div>
                  </div>
                  <p className="text-xs text-coffee-dark/70">
                    {settings?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                {/* Last Reminder */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-coffee-dark">Last Reminder</span>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                  <p className="text-xs text-coffee-dark/70">Never</p>
                </div>

                {/* Next Reminder */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-coffee-dark">Next Reminder</span>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-coffee-dark/70">
                    {settings ? `${DAYS_OF_WEEK[settings.dayOfWeek]} at ${settings.hour === 0 ? '12:00 AM' : settings.hour < 12 ? `${settings.hour}:00 AM` : settings.hour === 12 ? '12:00 PM' : `${settings.hour - 12}:00 PM`}` : 'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
