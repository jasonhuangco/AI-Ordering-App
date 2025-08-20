'use client'

import Link from 'next/link'
import { useBranding } from '../components/BrandingProvider'
import Logo from '../components/Logo'

export default function HomePage() {
  const { branding } = useBranding()

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: branding.backgroundColor || '#F5F5DC' }}
    >
      {/* Header */}
      <header 
        className="text-white shadow-lg"
        style={{ backgroundColor: branding.primaryColor || '#8B4513' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.companyName} 
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Logo className="text-white" width={48} height={48} />
              )}
              <div>
                <h1 className="text-3xl font-serif font-bold text-white">
                  {branding.companyName || 'Roaster Ordering v1'}
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  {branding.tagline || 'Premium Wholesale Coffee Platform'}
                </p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-white text-coffee-brown hover:opacity-90"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Customer Login
              </Link>
              <Link 
                href="/admin" 
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white hover:opacity-90"
                style={{ backgroundColor: branding.accentColor || '#DAA520' }}
              >
                Admin Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 
            className="text-5xl font-serif font-bold mb-6"
            style={{ color: branding.primaryColor || '#8B4513' }}
          >
            {branding.heroTitle || 'Wholesale Coffee Ordering'}
            <span 
              className="block"
              style={{ color: branding.accentColor || '#DAA520' }}
            >
              {branding.heroSubtitle || 'Made Simple'}
            </span>
          </h2>
          <p 
            className="text-xl max-w-3xl mx-auto mb-8 leading-relaxed"
            style={{ color: branding.primaryColor || '#8B4513' }}
          >
            {branding.heroDescription || 'Streamline your weekly coffee orders with our intuitive platform. Designed for cafés, restaurants, and retailers who demand quality and convenience.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login"
              className="text-lg px-8 py-4 rounded-lg font-medium transition-all duration-200 text-white hover:opacity-90"
              style={{ backgroundColor: branding.buttonColor || '#8B4513' }}
            >
              Place Your Order
            </Link>
          </div>
        </div>

        {/* Features Section */}
        {(branding.showFeatures !== false) && (
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div 
                className="text-4xl mb-4"
                style={{ color: branding.accentColor || '#DAA520' }}
              >
                ☕
              </div>
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Premium Selection
              </h3>
              <p 
                className="opacity-80"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Whole beans, espresso, retail packs, and accessories from our artisan roastery
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div 
                className="text-4xl mb-4"
                style={{ color: branding.accentColor || '#DAA520' }}
              >
                📱
              </div>
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Mobile Friendly
              </h3>
              <p 
                className="opacity-80"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Order from anywhere - optimized for phone use at your café or restaurant
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div 
                className="text-4xl mb-4"
                style={{ color: branding.accentColor || '#DAA520' }}
              >
                ⏰
              </div>
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Smart Reminders
              </h3>
              <p 
                className="opacity-80"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Never miss an order with automated email and SMS reminders
              </p>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {(branding.showStats !== false) && (
          <div 
            className="mt-16 rounded-lg p-8 text-white text-center"
            style={{ backgroundColor: branding.primaryColor || '#8B4513' }}
          >
            <h3 className="text-2xl font-serif font-bold mb-6">
              Trusted by Coffee Professionals
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: branding.secondaryColor || '#D2B48C' }}
                >
                  25+
                </div>
                <div className="text-sm opacity-90">Wholesale Accounts</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: branding.secondaryColor || '#D2B48C' }}
                >
                  100+
                </div>
                <div className="text-sm opacity-90">Weekly Orders</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: branding.secondaryColor || '#D2B48C' }}
                >
                  99%
                </div>
                <div className="text-sm opacity-90">On-Time Delivery</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer 
        className="text-white mt-20"
        style={{ backgroundColor: branding.primaryColor || '#8B4513' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-white/80 text-sm">
                {branding.contactEmail || 'support@roasterordering.com'}<br />
                {branding.contactPhone || '1-800-ROASTER'}<br />
                Mon-Fri 7AM-5PM PST
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link href="/login" className="block text-white/80 hover:text-white">
                  Customer Portal
                </Link>
                <Link href="/admin" className="block text-white/80 hover:text-white">
                  Admin Dashboard
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">About</h4>
              <p className="text-white/80 text-sm">
                Professional wholesale coffee ordering platform designed for 
                cafés, restaurants, and retailers.
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-4 text-center text-white/80 text-sm">
            <p>&copy; 2025 {branding.companyName || 'Roaster Ordering v1'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
