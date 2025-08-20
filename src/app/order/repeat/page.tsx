'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { generateOrderNumberWithSequence } from '../../../lib/orderUtils'

interface Order {
  id: string
  sequenceNumber: number
  total: number
  status: string
  createdAt: string
  user: {
    id: string
    email: string
    companyName: string
    contactName: string
    customerCode: number | null
  }
  items: {
    id: string
    quantity: number
    unitPrice: number
    product: {
      id: string
      name: string
      description: string
      category: string
      unit: string
      price: number
      isGlobal: boolean
      isActive: boolean
      imageUrl: string | null
      createdAt: string
      updatedAt: string
    }
  }[]
}

export default function RepeatOrderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReordering, setIsReordering] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER') {
      fetchRecentOrders()
    }
  }, [session])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=10')
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const repeatOrder = async (order: Order) => {
    setIsReordering(order.id)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: order.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.unitPrice
          }))
        })
      })

      if (response.ok) {
        const newOrder = await response.json()
        router.push(`/order/${newOrder.id}`)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Failed to repeat order:', error)
      alert('Failed to repeat order. Please try again.')
    } finally {
      setIsReordering(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown">Loading...</div>
    </div>
  }

  if (!session?.user || session.user.role !== 'CUSTOMER') {
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coffee-brown shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-white hover:text-coffee-light">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-serif font-bold text-white">Repeat Order</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-serif text-coffee-dark mb-4">No previous orders</h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t placed any orders yet. Start by browsing our products.
            </p>
            <Link
              href="/order/new"
              className="bg-coffee-brown text-white px-6 py-3 rounded-lg hover:bg-coffee-dark inline-block"
            >
              Place Your First Order
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-coffee-dark">
                Choose an order to repeat
              </h2>
              <p className="text-gray-600">
                Select from your recent orders to quickly reorder the same items.
              </p>
            </div>

            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-coffee-dark text-lg">
                          {order.sequenceNumber ? generateOrderNumberWithSequence(order.sequenceNumber, order.createdAt, order.user.customerCode) : `Order #${order.id.slice(-8)}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-lg font-bold text-coffee-brown mt-2">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Items:</h4>
                      <div className="text-sm text-gray-600">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between py-1">
                            <span>{item.product.name} ({item.quantity}x)</span>
                            <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Link
                        href={`/order/${order.id}`}
                        className="text-coffee-brown hover:text-coffee-dark text-sm"
                      >
                        View Details →
                      </Link>
                      <button
                        onClick={() => repeatOrder(order)}
                        disabled={isReordering === order.id}
                        className="bg-coffee-brown text-white px-4 py-2 rounded hover:bg-coffee-dark disabled:opacity-50"
                      >
                        {isReordering === order.id ? 'Reordering...' : 'Repeat Order'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/order/new"
                className="bg-white text-coffee-brown border border-coffee-brown px-6 py-3 rounded-lg hover:bg-coffee-light inline-block"
              >
                Create New Order Instead
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
