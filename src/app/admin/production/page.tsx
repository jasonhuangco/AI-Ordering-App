'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminNav from '../../../components/AdminNav'

interface ProductionItem {
  productId: string
  productName: string
  category: string
  unit: string
  totalQuantity: number
  totalProductionWeight: number
  orderCount: number
  productionDetails: {
    beanOrigin?: string
    roastLevel?: string
    productionWeightPerUnit?: number
    productionUnit?: string
    productionNotes?: string
    processingMethod?: string
    flavorProfile?: string[]
  }
  orders: Array<{
    orderId: string
    orderNumber: string
    customerName: string
    quantity: number
    productionWeight: number
    status: string
    dueDate?: string
  }>
}

interface ProductionSchedule {
  dateRange: {
    startDate: string
    endDate: string
  }
  totalItems: number
  totalOrders: number
  productionItems: ProductionItem[]
  ordersByStatus: Record<string, number>
  summary: {
    totalProducts: number
    totalQuantity: number
    byCategory: Record<string, {
      quantity: number
      products: number
    }>
  }
}

export default function ProductionSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedule, setSchedule] = useState<ProductionSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return oneWeekAgo.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Bulk actions
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchProductionSchedule()
  }, [session, status, router, startDate, endDate, statusFilter, includeArchived])

  const fetchProductionSchedule = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate,
        endDate,
        status: statusFilter,
        includeArchived: includeArchived.toString()
      })

      const response = await fetch(`/api/admin/production?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSchedule(data)
      } else {
        throw new Error('Failed to fetch production schedule')
      }
    } catch (error) {
      console.error('Error fetching production schedule:', error)
      setError('Failed to load production schedule')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (productId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedItems(newExpanded)
  }

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const selectAllOrdersForProduct = (productItem: ProductionItem) => {
    const newSelected = new Set(selectedOrders)
    productItem.orders.forEach(order => {
      newSelected.add(order.orderId)
    })
    setSelectedOrders(newSelected)
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.size === 0) return

    try {
      setBulkActionLoading(true)
      const response = await fetch('/api/admin/production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          status: newStatus
        })
      })

      if (response.ok) {
        setSelectedOrders(new Set())
        fetchProductionSchedule()
      } else {
        throw new Error('Failed to update order statuses')
      }
    } catch (error) {
      console.error('Error updating orders:', error)
      setError('Failed to update order statuses')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCategory = (category: string) => {
    return category?.toLowerCase().replace('_', ' ') || 'other'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WHOLE_BEANS': return '☕'
      case 'ESPRESSO': return '☕'
      case 'RETAIL_PACKS': return '📦'
      case 'ACCESSORIES': return '🔧'
      default: return '📦'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SHIPPED': return 'text-green-600 bg-green-100'
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-cream">
        <AdminNav currentPage="/admin/production" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-brown"></div>
            <p className="mt-2 text-coffee-brown">Loading production schedule...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <AdminNav currentPage="/admin/production" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav currentPage="/admin/production" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-dark mb-2">Production Schedule</h1>
          <p className="text-coffee-brown">Aggregate production requirements across all orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-brown"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-brown"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-brown"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="includeArchived"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeArchived" className="text-sm text-gray-700">
                Include archived orders
              </label>
            </div>
          </div>
        </div>

        {schedule && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-coffee-light/20 rounded-lg">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Total Products</p>
                    <p className="text-2xl font-bold text-coffee-dark">{schedule.summary.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Total Weight</p>
                    <p className="text-2xl font-bold text-coffee-dark">
                      {schedule.productionItems.reduce((sum, item) => sum + item.totalProductionWeight, 0).toFixed(1)} lbs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Total Orders</p>
                    <p className="text-2xl font-bold text-coffee-dark">{schedule.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Date Range</p>
                    <p className="text-sm font-bold text-coffee-dark">
                      {formatDate(schedule.dateRange.startDate)} - {formatDate(schedule.dateRange.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.size > 0 && (
              <div className="bg-coffee-light border border-coffee-brown rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <span className="font-medium text-coffee-dark">
                    {selectedOrders.size} order(s) selected
                  </span>
                                    <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkStatusUpdate('PENDING')}
                      disabled={bulkActionLoading}
                      className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Mark Pending
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                      disabled={bulkActionLoading}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark Confirmed
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('SHIPPED')}
                      disabled={bulkActionLoading}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Shipped
                    </button>
                    <button
                      onClick={() => setSelectedOrders(new Set())}
                      className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Production Items */}
            <div className="space-y-6">
              {schedule.productionItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-coffee-dark">{item.productName}</h3>
                          <div className="text-sm text-coffee-brown space-y-1">
                            <p className="capitalize">{formatCategory(item.category)} • {item.unit}</p>
                            {item.productionDetails.beanOrigin && (
                              <p><span className="font-medium">Origin:</span> {item.productionDetails.beanOrigin}</p>
                            )}
                            {item.productionDetails.roastLevel && (
                              <p><span className="font-medium">Roast:</span> {item.productionDetails.roastLevel}</p>
                            )}
                            {item.productionDetails.processingMethod && (
                              <p><span className="font-medium">Process:</span> {item.productionDetails.processingMethod}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-coffee-dark">{item.totalQuantity}</div>
                          <div className="text-lg font-semibold text-green-600">
                            {item.totalProductionWeight.toFixed(1)} {item.productionDetails.productionUnit || 'lbs'}
                          </div>
                          <div className="text-sm text-coffee-brown">{item.orderCount} orders</div>
                        </div>
                        <button
                          onClick={() => selectAllOrdersForProduct(item)}
                          className="px-3 py-2 bg-coffee-brown text-white text-sm rounded hover:bg-espresso"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => toggleExpanded(item.productId)}
                          className="p-2 text-coffee-brown hover:text-espresso"
                        >
                          {expandedItems.has(item.productId) ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>

                    {expandedItems.has(item.productId) && (
                      <div className="border-t border-gray-200 pt-4">
                        {/* Production Details */}
                        {(item.productionDetails.flavorProfile?.length || item.productionDetails.productionNotes) && (
                          <div className="mb-4 p-3 bg-blue-50 rounded">
                            {(item.productionDetails.flavorProfile && item.productionDetails.flavorProfile.length > 0) && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-gray-700">Flavor Profile: </span>
                                <span className="text-sm text-gray-600">
                                  {item.productionDetails.flavorProfile?.join(', ')}
                                </span>
                              </div>
                            )}
                            {item.productionDetails.productionNotes && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Production Notes: </span>
                                <span className="text-sm text-gray-600">{item.productionDetails.productionNotes}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Orders */}
                        <div className="space-y-2">
                          {item.orders.map((order) => (
                            <div key={order.orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.has(order.orderId)}
                                  onChange={() => toggleOrderSelection(order.orderId)}
                                  className="h-4 w-4 text-coffee-brown focus:ring-coffee-brown"
                                />
                                <div>
                                  <div className="font-medium text-coffee-dark">
                                    {order.orderNumber}
                                  </div>
                                  <div className="text-sm text-coffee-brown">
                                    {order.customerName}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="font-semibold">{order.quantity} {item.unit}</div>
                                  <div className="text-sm font-medium text-green-600">
                                    {order.productionWeight.toFixed(1)} {item.productionDetails.productionUnit || 'lbs'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatDate(order.dueDate || '')}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Category Summary */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-coffee-dark mb-4">Production by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(schedule.summary.byCategory).map(([category, data]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl mb-2">
                      {getCategoryIcon(category)}
                    </div>
                    <div className="font-semibold text-coffee-dark">{data.quantity} units</div>
                    <div className="text-sm text-coffee-brown">
                      {data.products} products
                    </div>
                    <div className="text-sm text-coffee-brown capitalize">
                      {formatCategory(category)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
