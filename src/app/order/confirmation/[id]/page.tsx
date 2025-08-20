'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { generateOrderNumberWithSequence } from '../../../../lib/orderUtils'
import { useBranding } from '../../../../components/BrandingProvider'

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

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { branding } = useBranding()
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
        console.error('Failed to fetch order')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalItems = () => {
    if (!order) return 0
    return order.items.reduce((total, item) => total + item.quantity, 0)
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown text-xl">Processing your order...</div>
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
              <h1 className="text-xl font-serif font-bold text-white">
                Order Confirmation
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-serif font-bold text-coffee-brown mb-4">
            Order Confirmed!
          </h2>
          <p className="text-xl text-coffee-dark mb-2">
            Thank you for your order
          </p>
          <p className="text-lg text-gray-600">
            We&apos;ve received your order and will begin processing it shortly.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-coffee-brown text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {order.sequenceNumber ? generateOrderNumberWithSequence(order.sequenceNumber, order.createdAt, order.user.customerCode) : `Order #${order.id.slice(-8)}`}
                </h3>
                <p className="text-coffee-light text-sm">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${order.total.toFixed(2)}</div>
                <div className="text-coffee-light text-sm">
                  {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Order Summary */}
          <div className="p-6">
            <h4 className="font-semibold text-coffee-dark mb-4">Items Ordered</h4>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <span className="font-medium text-coffee-dark">{item.product.name}</span>
                    <span className="text-gray-600 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-medium text-coffee-brown">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-coffee-dark mb-4 flex items-center">
            <span className="text-2xl mr-2">📋</span>
            What happens next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-coffee-brown text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-coffee-dark">Order Processing</p>
                <p className="text-sm text-gray-600">We&apos;ll review and prepare your order for roasting/packing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-coffee-brown text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-coffee-dark">Preparation</p>
                <p className="text-sm text-gray-600">Fresh roasting and careful packaging of your coffee</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-coffee-brown text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-coffee-dark">Delivery</p>
                <p className="text-sm text-gray-600">Your order will be delivered according to your usual schedule</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/order/${order.id}`}
            className="bg-coffee-brown text-white px-8 py-3 rounded-lg font-medium hover:bg-coffee-dark transition-colors text-center"
          >
            View Full Order Details
          </Link>
          <Link
            href="/dashboard"
            className="bg-white text-coffee-brown border-2 border-coffee-brown px-8 py-3 rounded-lg font-medium hover:bg-coffee-light transition-colors text-center"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/order/new"
            className="bg-coffee-light text-coffee-dark px-8 py-3 rounded-lg font-medium hover:bg-coffee-brown hover:text-white transition-colors text-center"
          >
            Place Another Order
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">
            Questions about your order?
          </p>
          <p className="text-coffee-brown font-medium">
            Contact us at {branding.contactEmail || 'support@roasterordering.com'} or {branding.contactPhone || '1-800-ROASTER'}
          </p>
        </div>
      </div>
    </div>
  )
}
