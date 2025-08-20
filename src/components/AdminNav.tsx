'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useBranding } from './BrandingProvider'

interface AdminNavProps {
  currentPage?: string
}

export default function AdminNav({ currentPage }: AdminNavProps) {
  const { data: session } = useSession()
  const { branding } = useBranding()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Products', icon: '☕' },
    { href: '/admin/orders', label: 'Orders', icon: '📦' },
    { href: '/admin/customers', label: 'Customers', icon: '👥' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <header className="bg-coffee-brown text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="text-xl font-bold text-white hover:text-coffee-light transition-colors">
              {branding.companyName} Admin
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  currentPage === item.href
                    ? 'bg-coffee-dark text-white'
                    : 'text-coffee-light hover:bg-coffee-dark hover:text-white'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <span className="text-coffee-light text-sm">
              Hello, {session?.user?.name || 'Admin'}
            </span>
            <button 
              onClick={handleLogout}
              className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center gap-1"
            >
              <span className="text-xs">🚪</span>
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-coffee-light hover:text-white p-2"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-coffee-dark">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-2 ${
                    currentPage === item.href
                      ? 'bg-coffee-dark text-white'
                      : 'text-coffee-light hover:bg-coffee-dark hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile user info and logout */}
              <div className="border-t border-coffee-dark pt-3 mt-3">
                <div className="px-3 py-2">
                  <p className="text-coffee-light text-sm">
                    Hello, {session?.user?.name || 'Admin'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-base font-medium transition-colors flex items-center gap-2 mx-3"
                  style={{ width: 'calc(100% - 1.5rem)' }}
                >
                  <span className="text-sm">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
