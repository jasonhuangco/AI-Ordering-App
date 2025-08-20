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
  notes: string | null
  createdAt: string
  user: {
    customerCode: number | null
  }
  items: {
    id: string
    quantity: number
    unitPrice: number
    product: {
      id: string
      name: string
      category: string
      unit: string
    }
  }[]
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER' && params.id) {
      fetchOrder()
    }
  }, [session, params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
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

  const repeatOrder = async () => {
    if (!order) return
    
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
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown">Loading...</div>
    </div>
  }

  if (!session?.user || session.user.role !== 'CUSTOMER' || !order) {
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
              <h1 className="text-xl font-serif font-bold text-white">
                {order.sequenceNumber ? generateOrderNumberWithSequence(order.sequenceNumber, order.createdAt, order.user.customerCode) : `Order #${order.id.slice(-8)}`}
              </h1>
            </div>
            <button
              onClick={repeatOrder}
              className="bg-white text-coffee-brown px-4 py-2 rounded hover:bg-coffee-light"
            >
              Repeat Order
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Order Info */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-coffee-dark mb-2">Order Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-coffee-dark mb-2">Order Date</h3>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-coffee-dark mb-2">Total</h3>
                <p className="text-xl font-bold text-coffee-brown">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4">
                <h3 className="font-semibold text-coffee-dark mb-2">Notes</h3>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h3 className="font-semibold text-coffee-dark mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-coffee-dark">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.product.category.replace('_', ' ')} • ${item.unitPrice.toFixed(2)} {item.product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {item.quantity}</p>
                    <p className="text-coffee-brown font-semibold">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-coffee-brown">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            href="/order/new"
            className="bg-coffee-brown text-white px-6 py-2 rounded hover:bg-coffee-dark"
          >
            Place New Order
          </Link>
          <Link
            href="/dashboard"
            className="bg-white text-coffee-brown border border-coffee-brown px-6 py-2 rounded hover:bg-coffee-light"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
