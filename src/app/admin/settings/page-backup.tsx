'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
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

  const updateSettings = (updates: Partial<ReminderSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates })
    }
  }

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayNumber]
  }

  const getTimeString = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${ampm}`
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-coffee-brown text-xl">Loading settings...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-red-600 text-xl">Failed to load settings</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coffee-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-coffee-light hover:text-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-serif font-bold">System Settings</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary bg-coffee-dark hover:bg-espresso disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Reminder Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-coffee-dark mb-4">
              Weekly Order Reminders
            </h2>
            <p className="text-coffee-dark opacity-70 text-sm mb-6">
              Configure when to send automated reminders to customers who haven&apos;t placed their weekly orders.
            </p>

            <div className="space-y-6">
              {/* Enable/Disable Reminders */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-coffee-dark">Enable Reminders</h3>
                  <p className="text-sm text-coffee-dark opacity-70">
                    Turn on/off the automated reminder system
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isActive}
                    onChange={(e) => updateSettings({ isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-brown"></div>
                </label>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-2">
                  Reminder Day
                </label>
                <select
                  value={settings.dayOfWeek}
                  onChange={(e) => updateSettings({ dayOfWeek: parseInt(e.target.value) })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                  disabled={!settings.isActive}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <option key={day} value={day}>
                      {getDayName(day)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-coffee-dark opacity-70 mt-1">
                  Currently set to: {getDayName(settings.dayOfWeek)}
                </p>
              </div>

              {/* Time of Day */}
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-2">
                  Reminder Time
                </label>
                <select
                  value={settings.hour}
                  onChange={(e) => updateSettings({ hour: parseInt(e.target.value) })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                  disabled={!settings.isActive}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {getTimeString(i)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-coffee-dark opacity-70 mt-1">
                  Currently set to: {getTimeString(settings.hour)}
                </p>
              </div>

              {/* Communication Methods */}
              <div>
                <h3 className="text-sm font-medium text-coffee-dark mb-3">
                  Notification Methods
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-coffee-dark">Email Reminders</span>
                      <p className="text-xs text-coffee-dark opacity-70">
                        Send reminder emails to customers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailEnabled}
                        onChange={(e) => updateSettings({ emailEnabled: e.target.checked })}
                        disabled={!settings.isActive}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-brown peer-disabled:opacity-50"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-coffee-dark">SMS Reminders</span>
                      <p className="text-xs text-coffee-dark opacity-70">
                        Send SMS text messages (requires Twilio setup)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smsEnabled}
                        onChange={(e) => updateSettings({ smsEnabled: e.target.checked })}
                        disabled={!settings.isActive}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-brown peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="bg-coffee-brown rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Status:</strong> {settings.isActive ? 'Active' : 'Inactive'}
              </div>
              <div>
                <strong>Schedule:</strong> {getDayName(settings.dayOfWeek)} at {getTimeString(settings.hour)}
              </div>
              <div>
                <strong>Email:</strong> {settings.emailEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <strong>SMS:</strong> {settings.smsEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-coffee-dark mb-4">
              Integration Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-coffee-dark">Database</span>
                </div>
                <span className="text-green-600 text-sm">Connected</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-coffee-dark">SendGrid (Email)</span>
                </div>
                <span className="text-yellow-600 text-sm">Setup Required</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-coffee-dark">Twilio (SMS)</span>
                </div>
                <span className="text-yellow-600 text-sm">Setup Required</span>
              </div>
            </div>
            <p className="text-xs text-coffee-dark opacity-70 mt-4">
              Configure API keys in environment variables to enable email and SMS features.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
