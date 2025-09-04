'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage('Please enter your email address')
      setMessageType('error')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address')
      setMessageType('error')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('If an account with that email exists, you will receive a password reset email shortly.')
        setMessageType('success')
        setEmail('')
      } else {
        setMessage(data.error || 'Failed to process password reset request')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-coffee-light/20 to-warm-gold/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-coffee-light/20 shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-coffee-dark mb-2">
              Forgot Password?
            </h1>
            <p className="text-coffee-dark/70">
              Enter your email address and we&apos;ll send you a temporary password.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              messageType === 'success' 
                ? 'bg-green-50 border-l-green-500 border border-green-200 text-green-800' 
                : 'bg-red-50 border-l-red-500 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {messageType === 'success' ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-coffee-dark mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-coffee-light/30 focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 transition-all duration-200"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-coffee-brown hover:bg-coffee-dark text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending Reset Email...
                </>
              ) : (
                <>
                  📧 Send Reset Email
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-coffee-dark/60">
              Remember your password?{' '}
              <Link 
                href="/login" 
                className="text-coffee-brown hover:text-coffee-dark font-medium"
              >
                Sign in here
              </Link>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Enter your email address</li>
                  <li>Check your email for a temporary password</li>
                  <li>Log in with the temporary password</li>
                  <li>Change your password in your profile</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
