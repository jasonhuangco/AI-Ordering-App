'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AddCustomerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: 'customer123', // Default password
    companyName: '',
    contactName: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/customers')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create customer')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Error creating customer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-coffee-brown text-xl">Loading...</div>
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
              <Link href="/admin/customers" className="text-coffee-light hover:text-white">
                ← Back to Customers
              </Link>
              <h1 className="text-2xl font-serif font-bold">Add New Customer</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-coffee-dark">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-coffee-dark">
                Password *
              </label>
              <input
                type="text"
                name="password"
                id="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.password}
                onChange={handleChange}
                placeholder="Default: customer123"
              />
              <p className="mt-1 text-xs text-coffee-dark opacity-70">
                Customer can change this after first login
              </p>
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-coffee-dark">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., Downtown Cafe"
              />
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-coffee-dark">
                Contact Person
              </label>
              <input
                type="text"
                name="contactName"
                id="contactName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-coffee-dark">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-coffee-dark">
                Business Address
              </label>
              <textarea
                name="address"
                id="address"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Customer Account Setup</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Customer will receive login credentials at the provided email</li>
                <li>• They can update their password and profile after first login</li>
                <li>• Account will be active immediately after creation</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/customers"
                className="px-4 py-2 border border-gray-300 rounded-md text-coffee-dark hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
