'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminNav from '../../../components/AdminNav'

interface AnalyticsData {
  summary: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    revenueGrowth: number
  }
  ordersByStatus: Record<string, number>
  topCustomers: Array<{
    email: string
    companyName: string
    contactName: string
    totalRevenue: number
    orderCount: number
  }>
  topProducts: Array<{
    id: string
    name: string
    category: string
    totalQuantity: number
    totalRevenue: number
    orderCount: number
  }>
  revenueByCategory: Record<string, number>
  revenueTrend: Array<{
    date: string
    revenue: number
  }>
  period: {
    days: number
    startDate: string
    endDate: string
  }
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('30')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [customers, setCustomers] = useState<Array<{ id: string, email: string, company_name: string }>>([])

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchCustomers()
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      fetchAnalytics()
    }
  }, [period, selectedCustomer, session])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ period })
      if (selectedCustomer) {
        params.append('customer', selectedCustomer)
      }

      const response = await fetch(`/api/admin/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        throw new Error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
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
      day: 'numeric'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-cream">
        <AdminNav currentPage="analytics" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-brown"></div>
            <p className="mt-2 text-coffee-brown">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <AdminNav currentPage="analytics" />
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
      <AdminNav currentPage="analytics" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-dark mb-2">Analytics Dashboard</h1>
          <p className="text-coffee-brown">Sales and order insights for your business</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-coffee-dark mb-4">Filters</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-brown mb-1">
                Time Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-brown"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-brown mb-1">
                Customer Filter
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-brown min-w-[200px]"
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name || customer.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-coffee-light/20 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Total Orders</p>
                    <p className="text-2xl font-bold text-coffee-dark">{analytics.summary.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Total Revenue</p>
                    <p className="text-2xl font-bold text-coffee-dark">{formatCurrency(analytics.summary.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Avg Order Value</p>
                    <p className="text-2xl font-bold text-coffee-dark">{formatCurrency(analytics.summary.averageOrderValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-coffee-brown">Revenue Growth</p>
                    <p className={`text-2xl font-bold ${analytics.summary.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.summary.revenueGrowth >= 0 ? '+' : ''}{analytics.summary.revenueGrowth}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Trend Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-coffee-dark mb-4">Revenue Trend</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.revenueTrend.map((point) => (
                    <div key={point.date} className="flex justify-between items-center py-1">
                      <span className="text-sm text-coffee-brown">{formatDate(point.date)}</span>
                      <span className="font-semibold text-coffee-dark">{formatCurrency(point.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders by Status */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-coffee-dark mb-4">Orders by Status</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          status === 'COMPLETED' ? 'bg-green-500' :
                          status === 'PENDING' ? 'bg-yellow-500' :
                          status === 'PROCESSING' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-coffee-brown capitalize">{status.toLowerCase()}</span>
                      </div>
                      <span className="font-semibold text-coffee-dark">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Customers */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-coffee-dark mb-4">Top Customers by Revenue</h3>
                <div className="space-y-3">
                  {analytics.topCustomers.slice(0, 10).map((customer, index) => (
                    <div key={customer.email} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-coffee-dark">
                          #{index + 1} {customer.companyName || customer.contactName}
                        </div>
                        <div className="text-sm text-coffee-brown">{customer.email}</div>
                        <div className="text-xs text-gray-500">{customer.orderCount} orders</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-coffee-dark">{formatCurrency(customer.totalRevenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-coffee-dark mb-4">Top Products by Revenue</h3>
                <div className="space-y-3">
                  {analytics.topProducts.slice(0, 10).map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-coffee-dark">#{index + 1} {product.name}</div>
                        <div className="text-sm text-coffee-brown">{product.category}</div>
                        <div className="text-xs text-gray-500">
                          {product.totalQuantity} units • {product.orderCount} orders
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-coffee-dark">{formatCurrency(product.totalRevenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue by Category */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-coffee-dark mb-4">Revenue by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.revenueByCategory).map(([category, revenue]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl mb-2">
                      {category === 'WHOLE_BEANS' ? '☕' : 
                       category === 'ESPRESSO' ? '☕' : 
                       category === 'RETAIL_PACKS' ? '📦' : 
                       category === 'ACCESSORIES' ? '🔧' : '📦'}
                    </div>
                    <div className="font-semibold text-coffee-dark">{formatCurrency(revenue)}</div>
                    <div className="text-sm text-coffee-brown capitalize">{category?.toLowerCase().replace('_', ' ') || 'other'}</div>
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
