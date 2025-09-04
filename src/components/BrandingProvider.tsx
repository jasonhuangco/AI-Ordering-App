'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface BrandingSettings {
  companyName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  buttonColor: string
  logoText: string
  logoUrl: string | null
  tagline: string
  fontFamily: string
  theme: 'light' | 'dark'
  // Homepage customization fields
  heroTitle?: string
  heroSubtitle?: string
  heroDescription?: string
  showStats?: boolean
  showFeatures?: boolean
  contactEmail?: string
  contactPhone?: string
}

interface BrandingContextType {
  branding: BrandingSettings
  updateBranding: (newBranding: Partial<BrandingSettings>) => void
  refreshBranding: () => Promise<void>
}

const defaultBranding: BrandingSettings = {
  companyName: 'Owlvericks'
  primaryColor: '#4d4c4c',
  secondaryColor: '#d9d9d9',
  accentColor: '#9f8950',
  backgroundColor: '#f0f0ef',
  buttonColor: '#675d56',
  logoText: 'Made Simple',
  logoUrl: null,
  tagline: 'Premium Wholesale Coffee',
  fontFamily: 'Inter',
  theme: 'light',
  // Homepage customization defaults
  heroTitle: 'Wholesale Coffee Ordering',
  heroSubtitle: 'Made Simple',
  heroDescription: 'Streamline your weekly coffee orders with our intuitive platform. Designed for cafés, restaurants, and retailers who demand quality and convenience.',
  showStats: true,
  showFeatures: true,
  contactEmail: 'orders@owlevericks.com',
  contactPhone: '1-800-ROASTER'
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  // Try to load cached branding from localStorage first to prevent flash
  const getInitialBranding = (): BrandingSettings => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('branding-settings')
        if (cached) {
          const cachedBranding = JSON.parse(cached)
          // Merge cached with defaults to ensure all fields exist
          return { ...defaultBranding, ...cachedBranding }
        }
      } catch (error) {
        console.warn('Failed to load cached branding settings:', error)
      }
    }
    return defaultBranding
  }

  const [branding, setBranding] = useState<BrandingSettings>(getInitialBranding)
  const [isLoading, setIsLoading] = useState(true)

    const refreshBranding = async () => {
    try {
      // Use public branding endpoint instead of admin-only endpoint
      const response = await fetch('/api/branding')
      if (response.ok) {
        const settings = await response.json()
        const mergedSettings = { ...defaultBranding, ...settings }
        setBranding(mergedSettings)
        applyBrandingToDOM(mergedSettings)
        
        // Cache the settings to prevent flash on next load
        try {
          localStorage.setItem('branding-settings', JSON.stringify(mergedSettings))
        } catch (error) {
          console.warn('Failed to cache branding settings:', error)
        }
      } else {
        console.warn('Failed to fetch branding settings, using cached or defaults')
        // Don't override cached settings on fetch failure
        applyBrandingToDOM(branding)
      }
    } catch (error) {
      console.error('Error fetching branding settings:', error)
      // Don't override cached settings on fetch error
      applyBrandingToDOM(branding)
    } finally {
      setIsLoading(false)
    }
  }

  const updateBranding = (newBranding: Partial<BrandingSettings>) => {
    const updated = { ...branding, ...newBranding }
    setBranding(updated)
    applyBrandingToDOM(updated)
    
    // Cache the updated settings
    try {
      localStorage.setItem('branding-settings', JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to cache updated branding settings:', error)
    }
  }

  const applyBrandingToDOM = (brandingSettings: BrandingSettings) => {
    const root = document.documentElement
    
    // Apply CSS custom properties for colors that match Tailwind config
    root.style.setProperty('--color-primary', brandingSettings.primaryColor)
    root.style.setProperty('--color-secondary', brandingSettings.secondaryColor)
    root.style.setProperty('--color-accent', brandingSettings.accentColor)
    root.style.setProperty('--color-background', brandingSettings.backgroundColor)
    root.style.setProperty('--color-button', brandingSettings.buttonColor)
    root.style.setProperty('--color-coffee-dark', brandingSettings.primaryColor)
    root.style.setProperty('--color-espresso', brandingSettings.primaryColor)
    
    // Apply font family
    root.style.setProperty('--font-family-primary', brandingSettings.fontFamily)
    
    // Apply background color to body
    document.body.style.backgroundColor = brandingSettings.backgroundColor
    
    // Update document title with proper null checks
    const titleElement = document.querySelector('title')
    if (titleElement && titleElement.textContent && brandingSettings.companyName) {
      const currentTitle = titleElement.textContent
      if (currentTitle && currentTitle.includes('Roaster Ordering')) {
        titleElement.textContent = currentTitle.replace('Roaster Ordering', brandingSettings.companyName)
      }
    }

    // Force a repaint by updating a data attribute
    root.setAttribute('data-brand-updated', Date.now().toString())
    
    console.log('Applied branding settings:', brandingSettings)
  }

  useEffect(() => {
    // Apply cached branding immediately to prevent flash
    applyBrandingToDOM(branding)
    
    // Then fetch latest settings in the background
    refreshBranding()
  }, [])

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}
