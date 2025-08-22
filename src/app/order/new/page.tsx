'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  unit: string
  isActive?: boolean
}

interface CartItem {
  product: Product
  quantity: number
}

export default function NewOrderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER') {
      fetchProducts()
      fetchFavorites()
      // Load cart from localStorage
      const savedCart = localStorage.getItem('orderCart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    }
  }, [session])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.filter((p: Product) => p.isActive !== false))
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.map((fav: any) => fav.product.id))
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      let newCart
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newCart = [...prevCart, { product, quantity: 1 }]
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

  const toggleFavorite = async (productId: string) => {
    const isFavorited = favorites.includes(productId)
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setFavorites(prev => prev.filter(id => id !== productId))
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
        if (response.ok) {
          setFavorites(prev => [...prev, productId])
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const goToReview = () => {
    if (cart.length === 0) return
    // Cart is already saved to localStorage, just navigate
    router.push('/order/review')
  }

  const categories = ['ALL', 'WHOLE_BEANS', 'ESPRESSO', 'RETAIL_PACKS', 'ACCESSORIES']
  
  // First filter by category
  let filteredProducts = selectedCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category === selectedCategory)
    
  // Then filter by favorites if enabled
  if (showFavoritesOnly) {
    filteredProducts = filteredProducts.filter(p => favorites.includes(p.id))
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
              <Link href="/dashboard" className="text-coffee-light hover:text-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-serif font-bold text-white">New Order</h1>
            </div>
            {cart.length > 0 && (
              <div className="text-coffee-light flex items-center space-x-2">
                <span>Cart ({cart.length})</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-coffee-dark mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-coffee-brown text-white'
                      : 'bg-white text-coffee-dark hover:bg-coffee-light'
                  }`}
                >
                  {category?.replace('_', ' ') || 'Other'}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites Filter */}
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-coffee-dark">Show only favorites</h3>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  showFavoritesOnly
                    ? 'bg-red-100 text-red-800 border-2 border-red-300'
                    : 'bg-white text-coffee-dark hover:bg-coffee-light border-2 border-gray-200'
                }`}
              >
                <span>{showFavoritesOnly ? '❤️' : '🤍'}</span>
                <span>
                  {showFavoritesOnly 
                    ? `Favorites Only (${filteredProducts.length})`
                    : 'All Products'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const cartItem = cart.find(item => item.product.id === product.id)
            const cartQuantity = cartItem ? cartItem.quantity : 0

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-coffee-dark">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-coffee-light text-coffee-dark text-xs px-2 py-1 rounded">
                        {product.category?.replace('_', ' ') || 'Other'}
                      </span>
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className={`p-1 rounded-full transition-colors ${
                          favorites.includes(product.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.includes(product.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-coffee-dark opacity-70 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-2xl font-bold text-coffee-brown">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-coffee-dark opacity-70 ml-1">
                        {product.unit}
                      </span>
                    </div>
                  </div>

                  {cartQuantity === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-coffee-brown text-white py-2 px-4 rounded-lg hover:bg-coffee-dark transition-colors"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                          className="w-8 h-8 rounded-full bg-coffee-light text-coffee-dark hover:bg-coffee-brown hover:text-white flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{cartQuantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                          className="w-8 h-8 rounded-full bg-coffee-light text-coffee-dark hover:bg-coffee-brown hover:text-white flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium text-coffee-brown">
                        ${(product.price * cartQuantity).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-xl font-semibold text-coffee-dark mb-2">
              No products found
            </h3>
            <p className="text-coffee-dark opacity-70">
              Try selecting a different category or check back later.
            </p>
          </div>
        )}
        {/* Floating Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-coffee-brown text-white p-4 rounded-lg shadow-lg">
            <div className="text-sm mb-2">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
            </div>
            <div className="text-lg font-bold mb-3">
              ${getCartTotal().toFixed(2)}
            </div>
            <button
              onClick={goToReview}
              disabled={cart.length === 0}
              className="block w-full bg-white text-coffee-brown px-4 py-2 rounded text-center font-medium hover:bg-coffee-light disabled:opacity-50"
            >
              Review Order
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
