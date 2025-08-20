'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
    unit: string
  }
}

interface Order {
  id: string
  sequenceNumber: number
  status: string
  total: number
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

interface Customer {
  id: string
  email: string
  companyName: string | null
  contactName: string | null
  phone: string | null
  address: string | null
  notes: string | null
  customerCode: number | null
}

export default function CustomerOrdersPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' && params.id) {
      fetchCustomerAndOrders()
    }
  }, [session, params.id])

  const fetchCustomerAndOrders = async () => {
    try {
      // Fetch customer details
      const customerResponse = await fetch(`/api/admin/customers/${params.id}`)
      if (customerResponse.ok) {
        const customerData = await customerResponse.json()
        setCustomer(customerData)
      }

      // Fetch customer orders
      const ordersResponse = await fetch(`/api/admin/orders?userId=${params.id}`)
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch customer and orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatOrderNumber = (sequenceNumber: number, createdAt: string, customerCode?: number) => {
    const date = new Date(createdAt)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const dateStr = `${year}${month}${day}`
    
    const customerStr = customerCode ? customerCode.toString().padStart(4, '0') : '0000'
    const sequenceStr = sequenceNumber.toString().padStart(4, '0')
    
    return `${customerStr}-${dateStr}-${sequenceStr}`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown">Loading...</div>
    </div>
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
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
              <h1 className="text-xl font-serif font-bold text-white">Customer Orders</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href={`/admin/customers/${params.id}/edit`}
                className="text-white hover:text-coffee-light px-3 py-1 border border-white/30 rounded text-sm"
              >
                Edit Customer
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Info Card */}
        {customer && (
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-coffee-dark mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Company:</span>
                  <span className="ml-2 text-gray-600">{customer.companyName || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="ml-2 text-gray-600">{customer.contactName || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{customer.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-600">{customer.phone || 'N/A'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-600">{customer.address || 'N/A'}</span>
                </div>
                {customer.notes && (
                  <div className="md:col-span-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <span className="font-medium text-coffee-dark">📝 Location Notes:</span>
                      <span className="ml-2 text-gray-600">{customer.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-coffee-dark">
                Order History ({orders.length} total)
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">📦</div>
                <p className="text-gray-600">This customer hasn&apos;t placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-coffee-dark">
                          Order #{formatOrderNumber(order.sequenceNumber, order.createdAt, customer?.customerCode || undefined)}
                        </h3>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="font-semibold text-coffee-dark">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity} × {item.product.name} ({item.product.unit})
                            </span>
                            <span className="text-gray-700">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Order Notes:</h4>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="px-3 py-1 bg-coffee-light text-coffee-dark rounded text-sm hover:bg-coffee-brown hover:text-white transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
