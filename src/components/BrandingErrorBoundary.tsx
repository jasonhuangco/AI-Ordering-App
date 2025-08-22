'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class BrandingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('Branding Error Boundary caught an error:', error, errorInfo)
    
    // You could also log to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-coffee-dark mb-4">
                Loading Application...
              </h1>
              <p className="text-coffee-brown mb-4">
                Please wait while we load your settings.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-coffee-brown text-white px-4 py-2 rounded-lg hover:bg-coffee-dark transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default BrandingErrorBoundary
