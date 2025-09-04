'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CustomerNav from '../../components/CustomerNav'

interface UserProfile {
  id: string
  email: string
  customerCode: number | null
  companyName: string | null
  contactName: string | null
  phone: string | null
  address: string | null
  notes: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  
  // Form states
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    address: '',
    notes: ''
  })
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          companyName: data.companyName || '',
          contactName: data.contactName || '',
          phone: data.phone || '',
          address: data.address || '',
          notes: data.notes || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setMessage('Profile updated successfully!')
        setMessageType('success')
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || 'Failed to update profile')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while updating profile')
      setMessageType('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match')
      setMessageType('error')
      setIsSaving(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long')
      setMessageType('error')
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        setMessage('✅ Password updated successfully! Your password has been changed and is now active.')
        setMessageType('success')
        setShowPasswordSuccess(true)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // Auto-hide the message and form after 5 seconds
        setTimeout(() => {
          setMessage('')
          setShowPasswordChange(false)
          setShowPasswordSuccess(false)
        }, 5000)
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || 'Failed to update password')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while updating password')
      setMessageType('error')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-coffee-light/20 to-warm-gold/30">
        <CustomerNav currentPage="/profile" />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coffee-brown"></div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-coffee-light/20 to-warm-gold/30">
      <CustomerNav currentPage="/profile" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-coffee-light/20 shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif font-bold text-coffee-dark">
              My Profile
            </h1>
            <div className="text-sm text-coffee-dark/60">
              Customer ID: {profile?.customerCode || 'N/A'}
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              messageType === 'success' 
                ? message.includes('Password updated') 
                  ? 'bg-green-50 border-l-green-500 border border-green-200 text-green-800 shadow-lg' 
                  : 'bg-green-50 border-l-green-500 border border-green-200 text-green-800'
                : 'bg-red-50 border-l-red-500 border border-red-200 text-red-800'
            } flex items-center gap-3`}>
              {messageType === 'success' && message.includes('Password updated') && (
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              )}
              <div className="flex-grow">
                {message}
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Profile Information */}
            <div>
              <h2 className="text-xl font-semibold text-coffee-dark mb-4">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-coffee-dark/60 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                      placeholder="Your business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-dark mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                    placeholder="Street address, city, state, zip"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-dark mb-2">
                    Location Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                    placeholder="Delivery instructions, building access codes, parking info, etc..."
                  />
                  <p className="text-xs text-coffee-dark/60 mt-1">
                    These notes are visible to admin staff to help with order delivery
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-coffee-brown hover:bg-coffee-dark text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save Profile
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Password Change */}
            <div className="border-t border-coffee-light/30 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-coffee-dark">Security</h2>
                  <p className="text-sm text-coffee-dark/60 mt-1">
                    Keep your account secure by using a strong, unique password
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-coffee-brown hover:text-coffee-dark transition-colors flex items-center gap-2"
                >
                  🔒 Change Password
                </button>
              </div>

              {showPasswordChange && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {showPasswordSuccess && (
                    <div className="bg-green-50 border-l-4 border-l-green-500 border border-green-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-800">Password Updated Successfully!</h3>
                          <p className="text-green-700 mt-1">Your password has been changed and is now active. This form will close automatically in a few seconds.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-coffee-dark mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-coffee-dark mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSaving || showPasswordSuccess}
                      className="bg-coffee-brown hover:bg-coffee-dark text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : showPasswordSuccess ? (
                        <>
                          ✅ Password Updated
                        </>
                      ) : (
                        <>
                          🔒 Update Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false)
                        setShowPasswordSuccess(false)
                        setMessage('')
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
