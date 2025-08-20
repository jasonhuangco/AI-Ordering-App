'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import CustomerNav from '../../components/CustomerNav'
import { generateOrderNumberWithSequence } from '../../lib/orderUtils'

interface Order {
  id: string
  sequenceNumber: number
  total: number
  status: string
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      category: string
    }
  }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [customerCode, setCustomerCode] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user) {
      fetchOrders()
      fetchCustomerInfo()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerInfo = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setCustomerCode(userData.customerCode)
      }
    } catch (error) {
      console.error('Failed to fetch customer info:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-coffee-brown text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <CustomerNav currentPage="/dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl border border-coffee-light/20 shadow-lg p-6">
          <h1 className="text-2xl font-serif font-bold text-coffee-dark">
            Welcome, {session?.user?.name || 'Customer'}
          </h1>
          <p className="text-coffee-dark/70 text-sm">
            {session?.user?.email}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid md:grid-cols-3 gap-4">
          <Link
            href="/order/new"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-coffee-brown"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">📋</div>
              <div>
                <h3 className="font-semibold text-coffee-dark">Place New Order</h3>
                <p className="text-sm text-coffee-dark opacity-70">Browse and order products</p>
              </div>
            </div>
          </Link>

          <Link
            href="/order/repeat"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-coffee-light"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">🔄</div>
              <div>
                <h3 className="font-semibold text-coffee-dark">Repeat Last Order</h3>
                <p className="text-sm text-coffee-dark opacity-70">Quick reorder</p>
              </div>
            </div>
          </Link>

          <Link
            href="/favorites"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-roast"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">⭐</div>
              <div>
                <h3 className="font-semibold text-coffee-dark">Favorites</h3>
                <p className="text-sm text-coffee-dark opacity-70">Your saved products</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-coffee-dark">Recent Orders</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-8 text-center text-coffee-dark opacity-70">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-lg mb-2">No orders yet</p>
              <p className="text-sm">
                <Link href="/order/new" className="text-coffee-brown hover:text-coffee-dark font-medium">
                  Place your first order
                </Link> to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-coffee-dark">
                        {order.sequenceNumber ? generateOrderNumberWithSequence(order.sequenceNumber, order.createdAt, customerCode) : `Order #${order.id.slice(-8)}`}
                      </h3>
                      <p className="text-sm text-coffee-dark opacity-70">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                      <p className="text-lg font-semibold text-coffee-dark mt-1">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-coffee-dark opacity-70">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}:
                    {order.items.slice(0, 3).map((item, index) => (
                      <span key={item.id}>
                        {index > 0 && ', '}
                        {item.quantity}x {item.product.name}
                      </span>
                    ))}
                    {order.items.length > 3 && `, +${order.items.length - 3} more`}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/order/${order.id}`}
                      className="text-coffee-brown hover:text-coffee-dark text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      className="text-coffee-brown hover:text-coffee-dark text-sm font-medium"
                      onClick={() => {
                        // Implement reorder functionality
                        console.log('Reorder:', order.id)
                      }}
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-coffee-brown rounded-lg p-6 text-white text-center">
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-coffee-light text-sm mb-4">
            Our team is here to help with your coffee ordering needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@roasterordering.com" className="text-coffee-light hover:text-white">
              📧 support@roasterordering.com
            </a>
            <a href="tel:1-800-ROASTER" className="text-coffee-light hover:text-white">
              📞 1-800-ROASTER
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
