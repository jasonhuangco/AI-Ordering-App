'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AddProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'WHOLE_BEANS',
    price: '',
    unit: 'per lb',
    isGlobal: true
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Submitting product:', formData)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        console.log('Product created successfully, redirecting...')
        router.push('/admin/products')
      } else {
        setError(responseData.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Network error occurred while creating product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-coffee-brown text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coffee-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products" className="text-coffee-light hover:text-white">
                ← Back to Products
              </Link>
              <h1 className="text-2xl font-serif font-bold">Add New Product</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-coffee-dark">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Ethiopian Yirgacheffe"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-coffee-dark">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the product, tasting notes, brewing recommendations..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-coffee-dark">
                Category
              </label>
              <select
                name="category"
                id="category"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="WHOLE_BEANS">Whole Beans</option>
                <option value="ESPRESSO">Espresso</option>
                <option value="RETAIL_PACKS">Retail Packs</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-coffee-dark">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-coffee-dark">
                  Unit
                </label>
                <select
                  name="unit"
                  id="unit"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-brown focus:border-coffee-brown"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="per lb">per lb</option>
                  <option value="per bag">per bag</option>
                  <option value="per pack">per pack</option>
                  <option value="each">each</option>
                  <option value="per case">per case</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isGlobal"
                  id="isGlobal"
                  checked={formData.isGlobal}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                  className="w-4 h-4 text-coffee-brown focus:ring-coffee-brown border-gray-300 rounded"
                />
                <label htmlFor="isGlobal" className="ml-2 block text-sm font-medium text-coffee-dark">
                  Global Product (visible to all customers)
                </label>
              </div>
              <p className="text-xs text-gray-600">
                If unchecked, this product will only be visible to specifically assigned customers
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/products"
                className="px-4 py-2 border border-gray-300 rounded-md text-coffee-dark hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
