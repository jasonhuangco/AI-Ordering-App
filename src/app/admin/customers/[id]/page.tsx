'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'

interface Customer {
  id: string
  email: string
  companyName: string | null
  contactName: string | null
  phone: string | null
  address: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
}

export default function CustomerDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' && customerId) {
      fetchCustomer()
    }
  }, [session, customerId])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        throw new Error('Failed to fetch customer')
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCustomerStatus = async () => {
    if (!customer) return

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !customer.isActive }),
      })

      if (response.ok) {
        setCustomer(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Failed to update customer status:', error)
      alert('Failed to update customer status')
    }
  }

  const deleteCustomer = async () => {
    if (!customer) return

    if (!confirm(`Are you sure you want to delete customer "${customer.email}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Customer deleted successfully')
        router.push('/admin/customers')
      } else {
        alert(data.error || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
      alert('Failed to delete customer')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-coffee-brown">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-cream">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-coffee-dark mb-4">Customer Not Found</h1>
            <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist.</p>
            <Link
              href="/admin/customers"
              className="bg-coffee-brown text-white px-4 py-2 rounded hover:bg-coffee-dark transition-colors"
            >
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/admin/customers"
            className="text-coffee-brown hover:text-coffee-dark font-medium"
          >
            ← Back to Customers
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-coffee-dark mb-2">
                {customer.companyName || 'No Company Name'}
              </h1>
              <p className="text-gray-600">{customer.contactName || 'No Contact Name'}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  customer.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-coffee-dark mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-600">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="ml-2 text-gray-600">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-coffee-dark mb-3">Account Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Customer ID:</span>
                  <span className="ml-2 text-gray-600 font-mono text-sm">{customer.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-600">
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-coffee-dark mb-3">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{customer.notes}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-coffee-dark mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/customers/${customer.id}/edit`}
                className="bg-coffee-brown text-white px-4 py-2 rounded hover:bg-coffee-dark transition-colors"
              >
                Edit Customer
              </Link>
              <Link
                href={`/admin/customers/${customer.id}/products`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Manage Products
              </Link>
              <Link
                href={`/admin/customers/${customer.id}/orders`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                View Orders
              </Link>
              <button
                onClick={toggleCustomerStatus}
                className={`px-4 py-2 rounded transition-colors ${
                  customer.isActive
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {customer.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={deleteCustomer}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
