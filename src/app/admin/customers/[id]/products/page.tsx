'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface ProductAssignment {
  id: string
  name: string
  description: string
  price: number
  category: string
  isGlobal: boolean
  isAssigned: boolean
  customPrice: number | null
  isActive: boolean
}

interface Customer {
  id: string
  name: string
  email: string
  company: string
  customerCode: string
}

export default function CustomerProductsPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [products, setProducts] = useState<ProductAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch customer and products data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer details
        const customerRes = await fetch(`/api/admin/customers/${customerId}`)
        if (!customerRes.ok) {
          throw new Error('Failed to fetch customer')
        }
        const customerData = await customerRes.json()
        setCustomer(customerData)

        // Fetch products with assignment status
        const productsRes = await fetch(`/api/admin/customers/${customerId}/products`)
        if (!productsRes.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await productsRes.json()
        setProducts(productsData.products)

        // Set initial selected products and custom prices
        const assigned = new Set<string>()
        const prices: Record<string, string> = {}
        
        productsData.products.forEach((product: ProductAssignment) => {
          if (product.isAssigned && product.isActive) {
            assigned.add(product.id)
          }
          if (product.customPrice) {
            prices[product.id] = product.customPrice.toString()
          }
        })

        setSelectedProducts(assigned)
        setCustomPrices(prices)
      } catch (error) {
        console.error('Error fetching data:', error)
        setMessage({
          type: 'error',
          text: 'Failed to load customer and product data'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [customerId])

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
      // Remove custom price when deselecting
      const newPrices = { ...customPrices }
      delete newPrices[productId]
      setCustomPrices(newPrices)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleCustomPriceChange = (productId: string, value: string) => {
    setCustomPrices(prev => ({
      ...prev,
      [productId]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const productIds = Array.from(selectedProducts)
      const customPricesData: Record<string, number> = {}
      
      // Convert custom prices to numbers
      Object.entries(customPrices).forEach(([productId, price]) => {
        if (price && !isNaN(parseFloat(price))) {
          customPricesData[productId] = parseFloat(price)
        }
      })

      const response = await fetch(`/api/admin/customers/${customerId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds,
          customPrices: customPricesData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save product assignments')
      }

      setMessage({
        type: 'success',
        text: 'Product assignments saved successfully'
      })

      // Refresh the data
      const productsRes = await fetch(`/api/admin/customers/${customerId}/products`)
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products)
      }
    } catch (error) {
      console.error('Error saving assignments:', error)
      setMessage({
        type: 'error',
        text: 'Failed to save product assignments'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-coffee-brown">Loading...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Customer not found</div>
        <button
          onClick={() => router.push('/admin/customers')}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back to Customers
        </button>
      </div>
    )
  }

  const globalProducts = products.filter(p => p.isGlobal)
  const nonGlobalProducts = products.filter(p => !p.isGlobal)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-coffee-dark">
            Product Assignments
          </h1>
          <p className="text-coffee-brown mt-2">
            {customer.company} ({customer.customerCode}) - {customer.email}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/customers')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Back to Customers
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-coffee-brown text-white rounded hover:bg-coffee-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Global Products */}
        <div className="bg-white border rounded-lg shadow">
          <div className="border-b p-4">
            <h2 className="text-xl font-semibold text-coffee-dark">
              Global Products ({globalProducts.length})
            </h2>
            <p className="text-sm text-coffee-brown">
              These products are available to all customers by default
            </p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {globalProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 text-coffee-brown"
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.category} - ${product.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.description}
                      </div>
                    </div>
                  </div>
                  {selectedProducts.has(product.id) && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Custom Price:</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`${product.price.toFixed(2)}`}
                        value={customPrices[product.id] || ''}
                        onChange={(e: any) => handleCustomPriceChange(product.id, e.target.value)}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Non-Global Products (if any) */}
        {nonGlobalProducts.length > 0 && (
          <div className="bg-white border rounded-lg shadow">
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold text-coffee-dark">
                Exclusive Products ({nonGlobalProducts.length})
              </h2>
              <p className="text-sm text-coffee-brown">
                These products are only available to specifically assigned customers
              </p>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {nonGlobalProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleProductToggle(product.id)}
                        className="w-4 h-4 text-coffee-brown"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">
                          {product.category} - ${product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.description}
                        </div>
                      </div>
                    </div>
                    {selectedProducts.has(product.id) && (
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Custom Price:</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`${product.price.toFixed(2)}`}
                          value={customPrices[product.id] || ''}
                          onChange={(e: any) => handleCustomPriceChange(product.id, e.target.value)}
                          className="w-24 px-2 py-1 border rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <div className="font-medium mb-2">How Product Assignments Work:</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Global products are visible to all customers by default</li>
            <li>You can assign custom prices for any product for this specific customer</li>
            <li>Exclusive products are only visible when specifically assigned</li>
            <li>Unchecked products will not be available to this customer</li>
            <li>Custom prices override the default product price for this customer only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
