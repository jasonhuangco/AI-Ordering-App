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
  role: string
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

  const updateCustomerRole = async (customerId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        fetchCustomers() // Refresh the list
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Failed to update customer role:', error)
      alert('Failed to update customer role')
    }
  }

  const getRoleDisplayInfo = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-800', description: 'Full access to all features' }
      case 'MANAGER':
        return { label: 'Manager', color: 'bg-blue-100 text-blue-800', description: 'Can see all pricing information' }
      case 'EMPLOYEE':
        return { label: 'Employee', color: 'bg-orange-100 text-orange-800', description: 'Limited pricing access based on product settings' }
      default:
        return { label: role, color: 'bg-gray-100 text-gray-800', description: 'Unknown role' }
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
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap inline-block ${
                            customer.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {/* Role Selector */}
                          <select
                            value={customer.role}
                            onChange={(e) => updateCustomerRole(customer.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border-none cursor-pointer ${getRoleDisplayInfo(customer.role).color}`}
                            title={getRoleDisplayInfo(customer.role).description}
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
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
                    <div className="flex items-center gap-1 lg:ml-4">
                      {/* Toggle Active Status */}
                      <button
                        onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                        className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                          customer.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={customer.isActive ? 'Hide Customer' : 'Show Customer'}
                      >
                        {customer.isActive ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Edit Customer */}
                      <Link
                        href={`/admin/customers/${customer.id}/edit`}
                        className="p-2 bg-coffee-light text-coffee-dark rounded-full hover:bg-coffee-brown hover:text-white hover:scale-110 transition-all duration-200"
                        title="Edit Customer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                      </Link>
                      
                      {/* View Orders */}
                      <Link
                        href={`/admin/customers/${customer.id}/orders`}
                        className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 hover:scale-110 transition-all duration-200"
                        title="View Customer Orders"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </Link>
                      
                      {/* Manage Products */}
                      <Link
                        href={`/admin/customers/${customer.id}/products`}
                        className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 hover:scale-110 transition-all duration-200"
                        title="Manage Customer Products"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 12a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1-6a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                        </svg>
                      </Link>
                      
                      {/* Delete Customer */}
                      <button
                        onClick={() => deleteCustomer(customer.id, customer.email)}
                        className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 hover:scale-110 transition-all duration-200"
                        title="Delete Customer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
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
