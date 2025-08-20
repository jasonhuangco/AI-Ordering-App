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
  companyName: 'Roaster Ordering',
  primaryColor: '#8B4513',
  secondaryColor: '#D2B48C',
  accentColor: '#DAA520',
  backgroundColor: '#F5F5DC',
  buttonColor: '#8B4513',
  logoText: 'Roaster Ordering',
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
  contactEmail: 'support@roasterordering.com',
  contactPhone: '1-800-ROASTER'
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding)

  const refreshBranding = async () => {
    try {
      // Check for cached branding first
      const cachedBranding = localStorage.getItem('brandingSettings')
      if (cachedBranding) {
        try {
          const parsed = JSON.parse(cachedBranding)
          setBranding(parsed)
          applyBrandingToDOM(parsed)
        } catch (error) {
          console.error('Error parsing cached branding:', error)
        }
      }

      // Fetch latest branding settings from server
      const response = await fetch('/api/admin/branding-settings')
      if (response.ok) {
        const data = await response.json()
        setBranding(data)
        applyBrandingToDOM(data)
        // Cache the new branding settings
        localStorage.setItem('brandingSettings', JSON.stringify(data))
      }
    } catch (error) {
      console.error('Failed to fetch branding settings:', error)
    }
  }

  const updateBranding = (newBranding: Partial<BrandingSettings>) => {
    const updated = { ...branding, ...newBranding }
    setBranding(updated)
    applyBrandingToDOM(updated)
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
    
    // Update document title
    const titleElement = document.querySelector('title')
    if (titleElement && titleElement.textContent?.includes('Roaster Ordering')) {
      titleElement.textContent = titleElement.textContent.replace('Roaster Ordering', brandingSettings.companyName)
    }

    // Force a repaint by updating a data attribute
    root.setAttribute('data-brand-updated', Date.now().toString())
    
    console.log('Applied branding settings:', brandingSettings)
  }

  useEffect(() => {
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
