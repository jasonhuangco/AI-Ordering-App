'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...')
      const response = await fetch('/api/products')
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
        {/* Products List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-coffee-dark">All Products</h2>
            <p className="text-sm text-coffee-dark opacity-70 mt-1">
              Manage your product catalog
            </p>
          </div>

          {products.length === 0 ? (
            <div className="p-8 text-center text-coffee-dark opacity-70">
              <div className="text-4xl mb-4">☕</div>
              <p className="text-lg mb-2">No products found</p>
              <Link
                href="/admin/products/new"
                className="text-coffee-brown hover:text-coffee-dark font-medium"
              >
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <div key={product.id} className="p-6">
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
                          ${product.price.toFixed(2)}
                        </span>
                        <span>{product.unit}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 lg:ml-4">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.isActive)}
                        className={`px-3 py-2 rounded text-sm font-medium text-center ${
                          product.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => toggleGlobalStatus(product.id, product.isGlobal)}
                        className={`px-3 py-2 rounded text-sm font-medium text-center ${
                          product.isGlobal
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {product.isGlobal ? 'Make Exclusive' : 'Make Global'}
                      </button>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="px-3 py-2 bg-coffee-light text-coffee-dark rounded text-sm font-medium hover:bg-coffee-brown hover:text-white text-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id, product.name)}
                        className="px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 text-center"
                      >
                        Delete
                      </button>
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
