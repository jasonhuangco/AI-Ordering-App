'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import AdminNav from '../../../components/AdminNav'

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

export default function AdminCustomersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchCustomers()
    }
  }, [session])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchCustomers() // Refresh the list
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Failed to update customer status:', error)
      alert('Failed to update customer status')
    }
  }

  const deleteCustomer = async (customerId: string, customerEmail: string) => {
    if (!confirm(`Are you sure you want to delete customer "${customerEmail}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Customer deleted successfully')
        fetchCustomers() // Refresh the list
      } else {
        alert(data.error || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
      alert('Failed to delete customer')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-coffee-brown text-xl">Loading customers...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav currentPage="/admin/customers" />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-serif font-bold text-coffee-dark">Customer Management</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              href="/admin/customers/new"
              className="btn-primary bg-coffee-dark hover:bg-espresso text-center"
            >
              Add New Customer
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Customers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-coffee-dark">All Customers</h2>
            <p className="text-sm text-coffee-dark opacity-70 mt-1">
              Manage your wholesale customer accounts
            </p>
          </div>

          {customers.length === 0 ? (
            <div className="p-8 text-center text-coffee-dark opacity-70">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-lg mb-2">No customers found</p>
              <Link
                href="/admin/customers/new"
                className="text-coffee-brown hover:text-coffee-dark font-medium"
              >
                Add your first customer
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <div key={customer.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 min-w-0">
                      {/* Customer Name and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2">
                        <h3 className="text-lg font-medium text-coffee-dark mb-2 sm:mb-0">
                          {customer.companyName || customer.contactName || 'Unknown'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap inline-block ${
                          customer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {/* Customer Details */}
                      <div className="space-y-1 text-sm text-coffee-dark opacity-70 break-words">
                        <p>📧 {customer.email}</p>
                        {customer.contactName && customer.companyName && (
                          <p>👤 {customer.contactName}</p>
                        )}
                        {customer.phone && (
                          <p>📞 {customer.phone}</p>
                        )}
                        {customer.address && (
                          <p>📍 {customer.address}</p>
                        )}
                        {customer.notes && (
                          <p className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                            <span className="font-medium text-coffee-dark">📝 Location Notes:</span> {customer.notes}
                          </p>
                        )}
                        <p>📅 Joined {formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 lg:ml-4">
                      <button
                        onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                        className={`px-3 py-2 rounded text-sm font-medium text-center ${
                          customer.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {customer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <Link
                        href={`/admin/customers/${customer.id}/edit`}
                        className="px-3 py-2 bg-coffee-light text-coffee-dark rounded text-sm font-medium hover:bg-coffee-brown hover:text-white text-center"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/customers/${customer.id}/orders`}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 text-center"
                      >
                        View Orders
                      </Link>
                      <Link
                        href={`/admin/customers/${customer.id}/products`}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 text-center"
                      >
                        Products
                      </Link>
                      <button
                        onClick={() => deleteCustomer(customer.id, customer.email)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
