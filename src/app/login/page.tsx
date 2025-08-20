'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { useBranding } from '../../components/BrandingProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { branding } = useBranding()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Get session to check user role
        const session = await getSession()
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        background: `linear-gradient(135deg, ${branding.primaryColor || '#8B4513'} 0%, ${branding.secondaryColor || '#A0522D'} 100%)`,
        backgroundColor: branding.backgroundColor || '#F5F5DC'
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex flex-col items-center space-y-4">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.companyName} 
                  className="w-20 h-20 object-contain drop-shadow-lg"
                />
              ) : (
                <Logo className="text-cream drop-shadow-lg" width={80} height={80} />
              )}
              <h1 className="text-4xl font-brand text-cream font-bold tracking-wide">
                {branding.companyName}
              </h1>
              <span className="text-lg font-heading text-cream/80 font-medium">
                v1.0
              </span>
            </div>
          </Link>
          <h2 className="mt-8 text-center text-2xl font-heading font-bold text-cream">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-cream/70 font-body">
            Sign in to your wholesale coffee ordering portal
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-coffee shadow-coffee p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-heading font-semibold text-coffee-dark mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border-2 border-coffee-light rounded-lg shadow-sm placeholder-coffee-light/60 focus:outline-none focus:ring-2 focus:ring-warm-gold focus:border-warm-gold transition-all duration-200 font-body"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-heading font-semibold text-coffee-dark mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border-2 border-coffee-light rounded-lg shadow-sm placeholder-coffee-light/60 focus:outline-none focus:ring-2 focus:ring-warm-gold focus:border-warm-gold transition-all duration-200 font-body"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-warm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warm-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-heading font-semibold text-lg"
              style={{ backgroundColor: branding.buttonColor || '#8B4513' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-coffee-dark/70 font-body">
              Need help accessing your account?{' '}
              <a href={`mailto:${branding.contactEmail || 'support@roasterordering.com'}`} className="font-medium text-coffee-brown hover:text-coffee-dark transition-colors">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-cream/80 hover:text-cream transition-colors font-body">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
