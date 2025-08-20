'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '../../../components/AdminNav'
import { generateOrderNumberWithSequence } from '../../../lib/orderUtils'

interface Order {
  id: string
  sequenceNumber: number
  user: {
    id: string
    email: string
    companyName: string | null
    contactName: string | null
    phone: string | null
    customerCode: number | null
  }
  total: number
  status: string
  notes: string | null
  createdAt: string
  items: {
    id: string
    quantity: number
    unitPrice: number
    product: {
      name: string
      category: string
      unit: string
    }
  }[]
}

interface Customer {
  id: string
  email: string
  companyName: string | null
  contactName: string | null
  customerCode: number | null
  isActive: boolean
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  unit: string
  isActive: boolean
}

interface OrderItem {
  productId: string
  quantity: number
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  
  // Create order modal state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderNotes, setOrderNotes] = useState<string>('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  // Debug logging
  console.log('Current customers state:', customers)
  console.log('Current products state:', products)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...')
      const response = await fetch('/api/admin/customers')
      console.log('Customers API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('All customers:', data)
        // Filter active customers and sort alphabetically
        const activeCustomers = data
          .filter((customer: Customer) => customer.isActive !== false)
          .sort((a: Customer, b: Customer) => {
            // Sort by company name first, then contact name, then email
            const nameA = (a.companyName || a.contactName || a.email).toLowerCase()
            const nameB = (b.companyName || b.contactName || b.email).toLowerCase()
            return nameA.localeCompare(nameB)
          })
        console.log('Active customers (sorted):', activeCustomers)
        setCustomers(activeCustomers)
      } else {
        console.error('Failed to fetch customers:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.filter((product: Product) => product.isActive))
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleOpenCreateModal = () => {
    console.log('Opening create order modal...')
    setShowCreateOrderModal(true)
    setSelectedCustomerId('')
    setOrderItems([])
    setOrderNotes('')
    console.log('About to fetch customers and products...')
    fetchCustomers()
    fetchProducts()
  }

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = orderItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setOrderItems(updatedItems)
  }

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  const createOrder = async () => {
    if (!selectedCustomerId || orderItems.length === 0) {
      alert('Please select a customer and add at least one item')
      return
    }

    // Validate all items have products selected and positive quantities
    const validItems = orderItems.filter(item => item.productId && item.quantity > 0)
    if (validItems.length !== orderItems.length) {
      alert('Please select products and ensure all quantities are greater than 0')
      return
    }

    setIsCreatingOrder(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: validItems,
          notes: orderNotes || null
        })
      })

      if (response.ok) {
        setShowCreateOrderModal(false)
        fetchOrders() // Refresh orders list
        alert('Order created successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to create order')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchOrders() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
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
  const filterOptions = ['ALL', ...statusOptions]

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

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
      <AdminNav currentPage="/admin/orders" />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-serif font-bold text-coffee-dark">Order Management</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary bg-coffee-dark hover:bg-espresso text-center"
            >
              Create New Order
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded text-sm ${
                  filterStatus === status
                    ? 'bg-coffee-brown text-white'
                    : 'bg-white text-coffee-brown border border-coffee-brown hover:bg-coffee-light'
                }`}
              >
                {status} {status !== 'ALL' && `(${orders.filter(o => o.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-serif text-coffee-dark mb-4">
              {filterStatus === 'ALL' ? 'No orders yet' : `No ${filterStatus.toLowerCase()} orders`}
            </h2>
            <p className="text-gray-600">
              {filterStatus === 'ALL' 
                ? 'Orders will appear here once customers start placing them.'
                : `No orders with ${filterStatus.toLowerCase()} status found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-coffee-dark">
                        {order.sequenceNumber ? generateOrderNumberWithSequence(order.sequenceNumber, order.createdAt, order.user.customerCode) : `Order #${order.id.slice(-8)}`}
                      </h3>
                      <p className="text-gray-600">
                        {order.user.companyName || order.user.contactName || order.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-xl font-bold text-coffee-brown mt-2">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.product.name} x{item.quantity}</span>
                          <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Notes:</h4>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Update Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-coffee-brown hover:text-coffee-dark text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-coffee-dark">Create New Order</h2>
                <button
                  onClick={() => setShowCreateOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-2">
                  Select Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-coffee-brown focus:border-coffee-brown"
                  required
                >
                  <option value="">Choose a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName || customer.contactName || customer.email} 
                      {customer.customerCode && ` (Code: ${customer.customerCode.toString().padStart(4, '0')})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-coffee-dark">
                    Order Items *
                  </label>
                  <button
                    onClick={addOrderItem}
                    className="btn-secondary bg-coffee-light text-coffee-dark hover:bg-coffee-brown hover:text-white text-sm"
                  >
                    + Add Item
                  </button>
                </div>

                {orderItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No items added yet</p>
                    <button
                      onClick={addOrderItem}
                      className="mt-2 text-coffee-brown hover:text-coffee-dark font-medium"
                    >
                      Add your first item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={item.productId}
                            onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-coffee-brown focus:border-coffee-brown"
                          >
                            <option value="">Select product...</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ${product.price.toFixed(2)}/{product.unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full p-2 border border-gray-300 rounded text-center focus:ring-coffee-brown focus:border-coffee-brown"
                            placeholder="Qty"
                          />
                        </div>
                        <div className="w-20 text-right">
                          {item.productId && (
                            <span className="text-sm font-medium text-coffee-dark">
                              ${((products.find(p => p.id === item.productId)?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeOrderItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Total */}
              {orderItems.length > 0 && (
                <div className="bg-coffee-light/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-coffee-dark">Order Total:</span>
                    <span className="text-xl font-bold text-coffee-brown">
                      ${calculateOrderTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-coffee-brown focus:border-coffee-brown"
                  rows={3}
                  placeholder="Add any special instructions or notes for this order..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="btn-secondary bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={isCreatingOrder}
              >
                Cancel
              </button>
              <button
                onClick={createOrder}
                disabled={isCreatingOrder || !selectedCustomerId || orderItems.length === 0}
                className="btn-primary bg-coffee-dark hover:bg-espresso disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? 'Creating Order...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
