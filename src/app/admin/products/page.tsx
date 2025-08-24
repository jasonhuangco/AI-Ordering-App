'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import AdminNav from '../../../components/AdminNav'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  unit: string
  isActive: boolean
  isGlobal: boolean
  createdAt?: string
  updatedAt?: string
  assignedCustomers?: Array<{
    userId: string
    customPrice?: number
    customer: {
      id: string
      email: string
      companyName: string
      contactName: string
    } | null
  }>
}

interface BulkAction {
  id: string
  label: string
  action: string
  requiresInput?: boolean
  inputType?: 'select'
  options?: Array<{ value: string; label: string }>
  confirmMessage?: string
  buttonClass?: string
}

type SortField = 'name' | 'category' | 'price' | 'isActive' | 'isGlobal' | 'createdAt'
type SortDirection = 'asc' | 'desc'

interface FilterState {
  category: string
  status: string // 'all', 'active', 'inactive'
  visibility: string // 'all', 'global', 'exclusive'
  search: string
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const bulkActionsRef = useRef<HTMLDivElement>(null)
  
  // Sorting and filtering state
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    status: 'all',
    visibility: 'all',
    search: ''
  })

  const bulkActions: BulkAction[] = [
    {
      id: 'activate',
      label: 'Activate Products',
      action: 'activate',
      confirmMessage: 'Are you sure you want to activate the selected products?',
      buttonClass: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      id: 'deactivate',
      label: 'Deactivate Products',
      action: 'deactivate',
      confirmMessage: 'Are you sure you want to deactivate the selected products?',
      buttonClass: 'bg-red-100 text-red-700 hover:bg-red-200'
    },
    {
      id: 'makeGlobal',
      label: 'Make Global',
      action: 'makeGlobal',
      confirmMessage: 'Are you sure you want to make the selected products global?',
      buttonClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      id: 'makeExclusive',
      label: 'Make Exclusive',
      action: 'makeExclusive',
      confirmMessage: 'Are you sure you want to make the selected products exclusive?',
      buttonClass: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
    },
    {
      id: 'updateCategory',
      label: 'Change Category',
      action: 'updateCategory',
      requiresInput: true,
      inputType: 'select',
      options: [
        { value: 'WHOLE_BEANS', label: 'Whole Beans' },
        { value: 'ESPRESSO', label: 'Espresso' },
        { value: 'RETAIL_PACKS', label: 'Retail Packs' },
        { value: 'ACCESSORIES', label: 'Accessories' }
      ],
      buttonClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
    {
      id: 'delete',
      label: 'Delete Products',
      action: 'delete',
      confirmMessage: 'Are you sure you want to permanently delete the selected products? This action cannot be undone.',
      buttonClass: 'bg-red-500 text-white hover:bg-red-600'
    }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchProducts()
    }
  }, [session])

  // Close bulk actions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target as Node)) {
        setBulkActionsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Apply sorting and filtering when products, sort, or filters change
  useEffect(() => {
    let filtered = [...products]
    
    // Apply filters
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category)
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(product => 
        filters.status === 'active' ? product.isActive : !product.isActive
      )
    }
    
    if (filters.visibility !== 'all') {
      filtered = filtered.filter(product => 
        filters.visibility === 'global' ? product.isGlobal : !product.isGlobal
      )
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case 'price':
          aValue = Number(a.price) || 0
          bValue = Number(b.price) || 0
          break
        case 'isActive':
          aValue = a.isActive ? 1 : 0
          bValue = b.isActive ? 1 : 0
          break
        case 'isGlobal':
          aValue = a.isGlobal ? 1 : 0
          bValue = b.isGlobal ? 1 : 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt || '').getTime()
          bValue = new Date(b.createdAt || '').getTime()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    setFilteredProducts(filtered)
  }, [products, sortField, sortDirection, filters])

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...')
      const response = await fetch('/api/products?includeCustomers=true')
      console.log('Products API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Products fetched:', data)
        setProducts(data)
      } else {
        console.error('Failed to fetch products:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCategory = (category: string | undefined | null) => {
    if (!category) return 'Other'
    return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchProducts() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update product status:', error)
    }
  }

  const toggleGlobalStatus = async (productId: string, isGlobal: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isGlobal: !isGlobal }),
      })

      if (response.ok) {
        fetchProducts() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update product global status:', error)
    }
  }

  const deleteProduct = async (productId: string, productName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${productName}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product')
    }
  }

  // Bulk action functions
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const performBulkAction = async (action: BulkAction, inputValue?: string) => {
    if (selectedProducts.size === 0) {
      alert('Please select at least one product')
      return
    }

    // Show confirmation if required
    if (action.confirmMessage) {
      const confirmed = window.confirm(
        `${action.confirmMessage}\n\nThis will affect ${selectedProducts.size} product(s).`
      )
      if (!confirmed) return
    }

    setBulkActionLoading(true)
    try {
      const requestBody: any = {
        action: action.action,
        productIds: Array.from(selectedProducts)
      }

      // Add updates object if input is required
      if (action.requiresInput && inputValue) {
        if (action.action === 'updateCategory') {
          requestBody.updates = { category: inputValue }
        }
      }

      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Bulk action completed successfully')
        setSelectedProducts(new Set()) // Clear selection
        setBulkActionsOpen(false)
        fetchProducts() // Refresh the list
      } else {
        alert(data.error || 'Failed to perform bulk action')
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      alert('Failed to perform bulk action')
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Sorting and filtering helper functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      visibility: 'all',
      search: ''
    })
    setSortField('name')
    setSortDirection('asc')
  }

  const getUniqueCategories = () => {
    const categories = new Set(products.map(p => p.category))
    return Array.from(categories).sort()
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-coffee-brown text-xl">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav currentPage="/admin/products" />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-serif font-bold text-coffee-dark">Product Management</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              href="/admin/products/new"
              className="btn-primary bg-coffee-dark hover:bg-espresso text-center"
            >
              Add New Product
            </Link>
            <button
              onClick={() => {
                setIsLoading(true)
                fetchProducts()
              }}
              className="btn-secondary bg-coffee-light text-coffee-dark hover:bg-coffee-brown hover:text-white text-center"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Sorting and Filtering Controls */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, description..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                value={filters.visibility}
                onChange={(e) => handleFilterChange('visibility', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
              >
                <option value="all">All Products</option>
                <option value="global">Global Only</option>
                <option value="exclusive">Exclusive Only</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="price">Price</option>
                  <option value="isActive">Status</option>
                  <option value="isGlobal">Visibility</option>
                  <option value="createdAt">Created</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-coffee-brown"
                  title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Summary and Clear */}
          <div className="mt-4 flex flex-wrap items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            {(filters.search || filters.category !== 'all' || filters.status !== 'all' || filters.visibility !== 'all' || sortField !== 'name' || sortDirection !== 'asc') && (
              <button
                onClick={clearFilters}
                className="text-sm text-coffee-brown hover:text-espresso font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
        {/* Bulk Actions Bar */}
        {selectedProducts.size > 0 && (
          <div className="mb-6 bg-coffee-light border border-coffee-brown rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-coffee-dark">
                  {selectedProducts.size} product(s) selected
                </span>
                <button
                  onClick={() => setSelectedProducts(new Set())}
                  className="text-sm text-coffee-dark hover:text-espresso"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="relative" ref={bulkActionsRef}>
                <button
                  onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
                  disabled={bulkActionLoading}
                  className="btn-secondary bg-coffee-brown text-white hover:bg-espresso disabled:opacity-50"
                >
                  {bulkActionLoading ? 'Processing...' : 'Bulk Actions ▼'}
                </button>
                
                {bulkActionsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="py-1">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700">Bulk Actions</h3>
                        <p className="text-xs text-gray-500">{selectedProducts.size} items selected</p>
                      </div>
                      {bulkActions.map((action) => (
                        <div key={action.id} className="border-b border-gray-50 last:border-b-0">
                          {action.requiresInput && action.inputType === 'select' ? (
                            <div className="px-4 py-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {action.label}
                              </label>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    performBulkAction(action, e.target.value)
                                    e.target.value = '' // Reset selection
                                  }
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                                defaultValue=""
                              >
                                <option value="">Select category...</option>
                                {action.options?.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <button
                              onClick={() => performBulkAction(action)}
                              disabled={bulkActionLoading}
                              className={`w-full text-left px-4 py-3 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors duration-150 ${
                                action.id === 'delete' 
                                  ? 'text-red-700 hover:bg-red-50' 
                                  : 'text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{action.label}</span>
                                {action.id === 'delete' && (
                                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </div>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-coffee-dark">All Products</h2>
                <p className="text-sm text-coffee-dark opacity-70 mt-1">
                  Manage your product catalog
                </p>
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm text-coffee-dark">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-coffee-brown text-coffee-brown focus:ring-coffee-brown focus:ring-2"
                    />
                    <span>Select all</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-coffee-dark opacity-70">
              <div className="text-4xl mb-4">☕</div>
              {products.length === 0 ? (
                <>
                  <p className="text-lg mb-2">No products found</p>
                  <Link
                    href="/admin/products/new"
                    className="text-coffee-brown hover:text-coffee-dark font-medium"
                  >
                    Add your first product
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">No products match your filters</p>
                  <button
                    onClick={clearFilters}
                    className="text-coffee-brown hover:text-coffee-dark font-medium"
                  >
                    Clear filters to see all products
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox for bulk selection */}
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-4 w-4 rounded border-coffee-brown text-coffee-brown focus:ring-coffee-brown focus:ring-2"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 min-w-0">
                          {/* Product Title and Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2">
                            <h3 className="text-lg font-medium text-coffee-dark mb-2 sm:mb-0">
                              {product.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-coffee-light text-coffee-dark text-xs px-2 py-1 rounded whitespace-nowrap">
                                {formatCategory(product.category)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                                product.isGlobal 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {product.isGlobal ? 'Global' : 'Exclusive'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-coffee-dark opacity-70 text-sm mb-2 break-words">
                            {product.description}
                          </p>
                          
                          {/* Price and Unit */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-coffee-dark opacity-70">
                            <span className="font-semibold text-coffee-brown text-lg">
                              ${(product.price || 0).toFixed(2)}
                            </span>
                            <span>{product.unit}</span>
                          </div>

                          {/* Customer Assignments (for exclusive products) */}
                          {!product.isGlobal && product.assignedCustomers && product.assignedCustomers.length > 0 && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                Assigned to {product.assignedCustomers.length} customer(s):
                              </h4>
                              <div className="space-y-1">
                                {product.assignedCustomers.slice(0, 3).map((assignment, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-yellow-700">
                                      {assignment.customer?.companyName || assignment.customer?.email}
                                    </span>
                                    {assignment.customPrice && (
                                      <span className="text-yellow-600 font-medium">
                                        Custom: ${Number(assignment.customPrice).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {product.assignedCustomers.length > 3 && (
                                  <div className="text-sm text-yellow-600 italic">
                                    +{product.assignedCustomers.length - 3} more...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* No customers assigned warning for exclusive products */}
                          {!product.isGlobal && (!product.assignedCustomers || product.assignedCustomers.length === 0) && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-md border border-orange-200">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-sm text-orange-700 font-medium">
                                  Exclusive product with no customer assignments
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 lg:ml-4">
                          {/* Toggle Active Status */}
                          <button
                            onClick={() => toggleProductStatus(product.id, product.isActive)}
                            className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                              product.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={product.isActive ? 'Hide Product' : 'Show Product'}
                          >
                            {product.isActive ? (
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
                          
                          {/* Toggle Global Status */}
                          <button
                            onClick={() => toggleGlobalStatus(product.id, product.isGlobal)}
                            className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                              product.isGlobal
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                            title={product.isGlobal ? 'Make Exclusive' : 'Make Global'}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                          </button>
                          
                          {/* Edit Product */}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 bg-coffee-light text-coffee-dark rounded-full hover:bg-coffee-brown hover:text-white hover:scale-110 transition-all duration-200"
                            title="Edit Product"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                          </Link>
                          
                          {/* Delete Product */}
                          <button
                            onClick={() => deleteProduct(product.id, product.name)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all duration-200"
                            title="Delete Product"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        </div>
                      </div>
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
