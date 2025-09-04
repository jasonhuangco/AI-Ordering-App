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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.companyName} 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                />
              ) : (
                <Logo className="text-white flex-shrink-0" width={40} height={40} />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white leading-tight">
                  {branding.companyName || 'Roaster Ordering v1'}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm mt-1 leading-tight">
                  {branding.tagline || 'Premium Wholesale Coffee Platform'}
                </p>
              </div>
            </div>
            <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-white text-center hover:opacity-90"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Customer Login
              </Link>
              <Link 
                href="/admin" 
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white text-center hover:opacity-90"
                style={{ backgroundColor: branding.accentColor || '#DAA520' }}
              >
                Admin Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4 sm:mb-6 leading-tight"
            style={{ color: branding.primaryColor || '#8B4513' }}
          >
            {branding.heroTitle || 'Wholesale Coffee Ordering'}
            <span 
              className="block mt-2"
              style={{ color: branding.accentColor || '#DAA520' }}
            >
              {branding.heroSubtitle || 'Made Simple'}
            </span>
          </h2>
          <p 
            className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4"
            style={{ color: branding.primaryColor || '#8B4513' }}
          >
            {branding.heroDescription || 'Streamline your weekly coffee orders with our intuitive platform. Designed for cafés, restaurants, and retailers who demand quality and convenience.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link 
              href="/login"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 text-white hover:opacity-90"
              style={{ backgroundColor: branding.buttonColor || '#8B4513' }}
            >
              Place Your Order
            </Link>
          </div>
        </div>

        {/* Features Section */}
        {(branding.showFeatures !== false) && (
          <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center mx-4 sm:mx-0">
              <div 
                className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                style={{ color: branding.accentColor || '#DAA520' }}
              >
                ☕
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Premium Selection
              </h3>
              <p 
                className="text-sm sm:text-base opacity-80"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Whole beans, espresso, retail packs, and accessories from our artisan roastery
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center mx-4 sm:mx-0">
              <div 
                className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                style={{ color: branding.accentColor || '#DAA520' }}
              >
                📱
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Mobile Friendly
              </h3>
              <p 
                className="text-sm sm:text-base opacity-80"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Order from anywhere - optimized for phone use at your café or restaurant
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center mx-4 sm:mx-0 sm:col-span-2 lg:col-span-1">
              <div 
                className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                style={{ color: branding.accentColor || '#DAA520' }}
              >
                ⏰
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ color: branding.primaryColor || '#8B4513' }}
              >
                Smart Reminders
              </h3>
              <p 
                className="text-sm sm:text-base opacity-80"
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
            className="mt-12 sm:mt-16 mx-4 sm:mx-0 rounded-lg p-6 sm:p-8 text-white text-center"
            style={{ backgroundColor: branding.primaryColor || '#8B4513' }}
          >
            <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6">
              Trusted by Coffee Professionals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <div 
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: branding.secondaryColor || '#D2B48C' }}
                >
                  25+
                </div>
                <div className="text-xs sm:text-sm opacity-90">Wholesale Accounts</div>
              </div>
              <div>
                <div 
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: branding.secondaryColor || '#D2B48C' }}
                >
                  100+
                </div>
                <div className="text-xs sm:text-sm opacity-90">Weekly Orders</div>
              </div>
              <div>
                <div 
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: branding.secondaryColor || '#D2B48C' }}
                >
                  99%
                </div>
                <div className="text-xs sm:text-sm opacity-90">On-Time Delivery</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer 
        className="text-white mt-12 sm:mt-20"
        style={{ backgroundColor: branding.primaryColor || '#8B4513' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                {branding.contactEmail || 'support@roasterordering.com'}<br />
                {branding.contactPhone || '1-800-ROASTER'}<br />
                Mon-Fri 7AM-5PM PST
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link href="/login" className="block text-white/80 hover:text-white">
                  Customer Portal
                </Link>
                <Link href="/admin" className="block text-white/80 hover:text-white">
                  Admin Dashboard
                </Link>
              </div>
            </div>
            <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h4 className="text-lg font-semibold mb-3 sm:mb-4">About</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Professional wholesale coffee ordering platform designed for 
                cafés, restaurants, and retailers.
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-6 sm:mt-8 pt-4 text-center text-white/80 text-sm">
            <p>&copy; 2025 {branding.companyName || 'Roaster Ordering v1'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
