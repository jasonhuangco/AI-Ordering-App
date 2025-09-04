'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { canUserSeePrices, hasHiddenPricesForUser, formatTotalForUser, UserRole } from '../../../lib/priceVisibility'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number | null
  unit: string
  isActive?: boolean
  hidePrices?: boolean
}

interface CartItem {
  product: Product
  quantity: number
}

export default function OrderReviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<number[]>([])

  // Fetch user's favorites
  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const favoritesData = await response.json()
        setFavorites(favoritesData.map((fav: any) => fav.productId))
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  // Toggle favorite status
  const toggleFavorite = async (productId: number) => {
    const isFavorited = favorites.includes(productId)
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setFavorites(prev => prev.filter(id => id !== productId))
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        })
        
        if (response.ok) {
          setFavorites(prev => [...prev, productId])
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    // Get cart from localStorage
    const savedCart = localStorage.getItem('orderCart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    } else {
      // No cart items, redirect to new order page
      router.push('/order/new')
    }
    
    // Fetch favorites
    fetchFavorites()
  }, [router])

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      const updatedCart = cart.filter(item => item.product.id !== productId)
      setCart(updatedCart)
      localStorage.setItem('orderCart', JSON.stringify(updatedCart))
    } else {
      const updatedCart = cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      setCart(updatedCart)
      localStorage.setItem('orderCart', JSON.stringify(updatedCart))
    }
  }

  const removeItem = (productId: string) => {
    const updatedCart = cart.filter(item => item.product.id !== productId)
    setCart(updatedCart)
    localStorage.setItem('orderCart', JSON.stringify(updatedCart))
  }

  const getCartTotal = () => {
    const total = cart.reduce((total, item) => {
      if (!canUserSeePrices(session?.user?.role as UserRole, item.product)) return total
      return total + ((item.product.price || 0) * item.quantity)
    }, 0)
    return Number.isFinite(total) ? total : 0
  }

  const hasHiddenPriceItems = () => {
    if (!session?.user?.role) return false
    return hasHiddenPricesForUser(session.user.role as UserRole, cart)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const goBackToShopping = () => {
    router.push('/order/new')
  }

  const submitOrder = async () => {
    if (cart.length === 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          notes: orderNotes || null
        })
      })

      if (response.ok) {
        const order = await response.json()
        // Clear the cart
        localStorage.removeItem('orderCart')
        router.push(`/order/confirmation/${order.id}`)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Failed to submit order:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown">Loading...</div>
    </div>
  }

  if (!session?.user || session.user.role === 'ADMIN') {
    return null
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="bg-coffee-brown shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/order/new" className="text-coffee-light hover:text-white">
                  ← Back to Shopping
                </Link>
                <h1 className="text-xl font-serif font-bold text-white">Review Order</h1>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-serif text-coffee-dark mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to review your order.</p>
          <Link
            href="/order/new"
            className="bg-coffee-brown text-white px-6 py-3 rounded-lg hover:bg-coffee-dark inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coffee-brown shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={goBackToShopping}
                className="text-coffee-light hover:text-white"
              >
                ← Continue Shopping
              </button>
              <h1 className="text-xl font-serif font-bold text-white">Review Your Order</h1>
            </div>
            <div className="text-coffee-light text-sm">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} • {formatTotalForUser(session?.user?.role as UserRole, getCartTotal(), hasHiddenPriceItems())}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-coffee-brown text-white p-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <p className="text-coffee-light text-sm">Review and modify your items before placing the order</p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-coffee-dark">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.description}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-coffee-light px-2 py-1 rounded">
                            {item.product.category?.replace('_', ' ') || 'Other'}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            {canUserSeePrices(session?.user?.role as UserRole, item.product) ? (
                              `$${(item.product.price || 0).toFixed(2)} ${item.product.unit}`
                            ) : (
                              `Unit: ${item.product.unit}`
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="text-right w-20">
                      <div className="font-semibold text-coffee-brown">
                        {canUserSeePrices(session?.user?.role as UserRole, item.product) ? (
                          `$${((item.product.price || 0) * item.quantity).toFixed(2)}`
                        ) : (
                          `${item.quantity} ${item.product.unit}${item.quantity !== 1 ? 's' : ''}`
                        )}
                      </div>
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(Number(item.product.id))}
                      className="text-xl hover:scale-110 transition-transform p-1"
                      title={favorites.includes(Number(item.product.id)) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {favorites.includes(Number(item.product.id)) ? '❤️' : '🤍'}
                    </button>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Notes */}
            <div className="mt-6 pt-6 border-t">
              <label className="block text-sm font-medium text-coffee-dark mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special instructions or notes for your order..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown"
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total ({getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''})</span>
                <span className="text-coffee-brown">
                  {formatTotalForUser(session?.user?.role as UserRole, getCartTotal(), hasHiddenPriceItems())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={goBackToShopping}
            className="bg-white text-coffee-brown border-2 border-coffee-brown px-8 py-3 rounded-lg font-medium hover:bg-coffee-light transition-colors"
          >
            Add More Items
          </button>
          <button
            onClick={submitOrder}
            disabled={isSubmitting || cart.length === 0}
            className="bg-coffee-brown text-white px-8 py-3 rounded-lg font-medium hover:bg-coffee-dark disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
