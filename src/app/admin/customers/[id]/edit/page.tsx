'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Customer {
  id: string
  email: string
  companyName: string | null
  contactName: string | null
  phone: string | null
  address: string | null
  notes: string | null
  isActive: boolean
  role: string
  createdAt: string
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    address: '',
    notes: '',
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' && params.id) {
      fetchCustomer()
    }
  }, [session, params.id])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
        setFormData({
          email: data.email || '',
          companyName: data.companyName || '',
          contactName: data.contactName || '',
          phone: data.phone || '',
          address: data.address || '',
          notes: data.notes || '',
          isActive: data.isActive
        })
      } else {
        router.push('/admin/customers')
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      router.push('/admin/customers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch(`/api/admin/customers/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/customers')
      } else {
        setErrors({ submit: data.error || 'Failed to update customer' })
      }
    } catch (error) {
      console.error('Failed to update customer:', error)
      setErrors({ submit: 'Failed to update customer' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown">Loading...</div>
    </div>
  }

  if (!session?.user || session.user.role !== 'ADMIN' || !customer) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coffee-brown shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/customers" className="text-white hover:text-coffee-light">
                ← Back to Customers
              </Link>
              <h1 className="text-xl font-serif font-bold text-white">Edit Customer</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href={`/admin/customers/${params.id}/orders`}
                className="text-white hover:text-coffee-light px-3 py-1 border border-white/30 rounded text-sm"
              >
                View Orders
              </Link>
              <Link 
                href={`/admin/customers/${params.id}/products`}
                className="text-white hover:text-coffee-light px-3 py-1 border border-white/30 rounded text-sm"
              >
                Manage Products
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-coffee-dark">Customer Information</h2>
              <p className="text-gray-600 text-sm">
                Update the customer&apos;s account details and settings.
              </p>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-coffee-brown focus:border-coffee-brown ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="customer@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-coffee-brown focus:border-coffee-brown ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Coffee Shop Name"
                  />
                  {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-coffee-brown focus:border-coffee-brown ${
                      errors.contactName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.contactName && <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-brown focus:border-coffee-brown"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Location Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="Special delivery instructions, location details, etc."
                />
                <p className="mt-1 text-sm text-gray-500">
                  These notes help with order delivery and are visible to delivery staff
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-coffee-brown focus:ring-coffee-brown border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Account is active (customer can login and place orders)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Link
                  href="/admin/customers"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-coffee-dark mb-4">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Customer ID:</span>
                <span className="ml-2 text-gray-600">{customer.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account Created:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Role:</span>
                <span className="ml-2 text-gray-600">{customer.role}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  customer.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
