'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Favorite {
  id: string
  createdAt: string
  product: {
    id: string
    name: string
    description: string
    category: string
    price: number
    unit: string
  }
}

interface CartItem {
  product: {
    id: string
    name: string
    description: string
    category: string
    price: number
    unit: string
  }
  quantity: number
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER') {
      fetchFavorites()
      // Load cart from localStorage
      const savedCart = localStorage.getItem('orderCart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    }
  }, [session])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (productId: string) => {
    try {
      const response = await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setFavorites(prevFavorites => 
          prevFavorites.filter(fav => fav.product.id !== productId)
        )
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  const addToCart = (product: Favorite['product'], quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      let newCart
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newCart = [...prevCart, { product, quantity }]
      }
      // Persist to localStorage
      localStorage.setItem('orderCart', JSON.stringify(newCart))
      return newCart
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      let newCart
      if (quantity <= 0) {
        newCart = prevCart.filter(item => item.product.id !== productId)
      } else {
        newCart = prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      }
      // Persist to localStorage
      localStorage.setItem('orderCart', JSON.stringify(newCart))
      return newCart
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const goToReview = () => {
    if (cart.length === 0) return
    // Cart is already saved to localStorage, just navigate
    router.push('/order/review')
  }

  const createOrderWithFavorites = async () => {
    if (favorites.length === 0) return

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: favorites.map(fav => ({
            productId: fav.product.id,
            quantity: 1,
            price: fav.product.price
          }))
        })
      })

      if (response.ok) {
        const order = await response.json()
        router.push(`/order/${order.id}`)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to create order. Please try again.')
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown">Loading...</div>
    </div>
  }

  if (!session?.user || session.user.role !== 'CUSTOMER') {
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coffee-brown shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-white hover:text-coffee-light">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-serif font-bold text-white">My Favorites</h1>
            </div>
            <div className="flex items-center space-x-4">
              {cart.length > 0 && (
                <div className="text-coffee-light flex items-center space-x-4">
                  <span>Cart ({cart.length})</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                  <button
                    onClick={goToReview}
                    className="bg-white text-coffee-brown px-4 py-2 rounded hover:bg-coffee-light"
                  >
                    Review Cart
                  </button>
                </div>
              )}
              {favorites.length > 0 && (
                <button
                  onClick={createOrderWithFavorites}
                  className="bg-coffee-light text-coffee-brown px-4 py-2 rounded hover:bg-cream"
                >
                  Quick Order All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <h2 className="text-2xl font-serif text-coffee-dark mb-4">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start browsing our catalog by placing a new order to add your favorites.
            </p>
            <Link
              href="/order/new"
              className="bg-coffee-brown text-white px-6 py-3 rounded-lg hover:bg-coffee-dark inline-block"
            >
              Place New Order
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-coffee-dark">
                {favorites.length} favorite product{favorites.length !== 1 ? 's' : ''}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map(favorite => {
                const cartItem = cart.find(item => item.product.id === favorite.product.id)
                const cartQuantity = cartItem ? cartItem.quantity : 0

                return (
                  <div key={favorite.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-coffee-dark">{favorite.product.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-coffee-light text-coffee-dark text-xs px-2 py-1 rounded">
                            {favorite.product.category?.replace('_', ' ') || 'Other'}
                          </span>
                          <button
                            onClick={() => removeFavorite(favorite.product.id)}
                            className="text-xl hover:scale-110 transition-transform"
                            title="Remove from favorites"
                          >
                            ❤️
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{favorite.product.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-coffee-brown">
                          ${favorite.product.price.toFixed(2)} {favorite.product.unit}
                        </span>
                        <div className="text-xs text-gray-500">
                          Added {new Date(favorite.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Add to Cart Controls */}
                      <div className="flex items-center justify-between">
                        {cartQuantity === 0 ? (
                          <button
                            onClick={() => addToCart(favorite.product)}
                            className="flex-1 bg-coffee-brown text-white py-2 px-4 rounded-lg hover:bg-coffee-dark transition-colors"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(favorite.product.id, cartQuantity - 1)}
                                className="w-8 h-8 rounded-full bg-coffee-light hover:bg-coffee-brown hover:text-white flex items-center justify-center transition-colors"
                              >
                                -
                              </button>
                              <span className="font-medium min-w-[2rem] text-center">{cartQuantity}</span>
                              <button
                                onClick={() => updateQuantity(favorite.product.id, cartQuantity + 1)}
                                className="w-8 h-8 rounded-full bg-coffee-light hover:bg-coffee-brown hover:text-white flex items-center justify-center transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-medium text-coffee-brown">
                              ${(favorite.product.price * cartQuantity).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
