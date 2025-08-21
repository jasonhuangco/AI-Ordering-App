'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { generateOrderNumberWithSequence } from '../../../../lib/orderUtils'

interface Order {
  id: string
  sequenceNumber: number
  user: {
    id: string
    email: string
    companyName: string | null
    contactName: string | null
    phone: string | null
    address: string | null
    customerCode: number | null
  }
  total: number
  status: string
  notes: string | null
  isArchived?: boolean
  createdAt: string
  updatedAt: string
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
    }
  }[]
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [notesUpdate, setNotesUpdate] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' && params.id) {
      fetchOrder()
    }
  }, [session, params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setStatusUpdate(data.status)
        setNotesUpdate(data.notes || '')
      } else {
        router.push('/admin/orders')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      router.push('/admin/orders')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrder = async () => {
    if (!order) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: statusUpdate,
          notes: notesUpdate.trim() || null
        })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder)
        alert('Order updated successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order')
    } finally {
      setIsUpdating(false)
    }
  }

  const archiveOrder = async () => {
    if (!order) return
    
    if (!confirm('Are you sure you want to archive this order? It will be hidden from the main list.')) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' })
      })

      if (response.ok) {
        alert('Order archived successfully!')
        router.push('/admin/orders')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to archive order')
      }
    } catch (error) {
      console.error('Failed to archive order:', error)
      alert('Failed to archive order')
    } finally {
      setIsUpdating(false)
    }
  }

  const unarchiveOrder = async () => {
    if (!order) return
    
    if (!confirm('Are you sure you want to unarchive this order? It will appear in the main orders list.')) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unarchive' })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder({ ...order, isArchived: false })
        alert('Order unarchived successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to unarchive order')
      }
    } catch (error) {
      console.error('Failed to unarchive order:', error)
      alert('Failed to unarchive order')
    } finally {
      setIsUpdating(false)
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

  const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED']

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown">Loading...</div>
    </div>
  }

  if (!session?.user || session.user.role !== 'ADMIN' || !order) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coffee-brown shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/orders" className="text-white hover:text-coffee-light">
                ← Back to Orders
              </Link>
              <h1 className="text-xl font-serif font-bold text-white">
                {order.sequenceNumber ? generateOrderNumberWithSequence(order.sequenceNumber, order.createdAt, order.user.customerCode) : `Order #${order.id.slice(-8)}`}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-coffee-dark mb-4">Order Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Order Number</h3>
                    <p className="text-gray-600 font-mono">
                      {order.sequenceNumber ? generateOrderNumberWithSequence(order.sequenceNumber, order.createdAt, order.user.customerCode) : `Order #${order.id.slice(-8)}`}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Status</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.isArchived && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          ARCHIVED
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Order Date</h3>
                    <p className="text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Last Updated</h3>
                    <p className="text-gray-600">
                      {new Date(order.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-700">Total Amount</h3>
                    <p className="text-2xl font-bold text-coffee-brown">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-coffee-dark mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Email</h3>
                    <p className="text-gray-600">{order.user.email}</p>
                  </div>
                  {order.user.companyName && (
                    <div>
                      <h3 className="font-medium text-gray-700">Company</h3>
                      <p className="text-gray-600">{order.user.companyName}</p>
                    </div>
                  )}
                  {order.user.contactName && (
                    <div>
                      <h3 className="font-medium text-gray-700">Contact Name</h3>
                      <p className="text-gray-600">{order.user.contactName}</p>
                    </div>
                  )}
                  {order.user.phone && (
                    <div>
                      <h3 className="font-medium text-gray-700">Phone</h3>
                      <p className="text-gray-600">{order.user.phone}</p>
                    </div>
                  )}
                  {order.user.address && (
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700">Address</h3>
                      <p className="text-gray-600">{order.user.address}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/admin/customers/${order.user.id}/edit`}
                    className="text-coffee-brown hover:text-coffee-dark font-medium"
                  >
                    Edit Customer →
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-coffee-dark mb-4">Order Items</h2>
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-coffee-dark">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.description}</p>
                        <p className="text-sm text-gray-500">
                          {item.product.category.replace('_', ' ')} • ${item.unitPrice.toFixed(2)} {item.product.unit}
                        </p>
                      </div>
                      <div className="text-right ml-4">
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
          </div>

          {/* Update Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-coffee-dark mb-4">Update Order</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notesUpdate}
                      onChange={(e) => setNotesUpdate(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Add notes about this order..."
                    />
                  </div>
                  
                  <button
                    onClick={updateOrder}
                    disabled={isUpdating || (statusUpdate === order.status && notesUpdate === (order.notes || ''))}
                    className="w-full bg-coffee-brown text-white py-2 rounded-lg hover:bg-coffee-dark disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update Order'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-coffee-dark mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href={`/admin/customers/${order.user.id}/orders`}
                    className="block w-full text-center bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200"
                  >
                    View Customer&apos;s Orders
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Back to All Orders
                  </Link>
                  {!order.isArchived ? (
                    <button
                      onClick={archiveOrder}
                      disabled={isUpdating}
                      className="block w-full text-center bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      {isUpdating ? 'Archiving...' : 'Archive Order'}
                    </button>
                  ) : (
                    <button
                      onClick={unarchiveOrder}
                      disabled={isUpdating}
                      className="block w-full text-center bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 disabled:opacity-50"
                    >
                      {isUpdating ? 'Unarchiving...' : 'Unarchive Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
