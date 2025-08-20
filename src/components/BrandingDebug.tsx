'use client'

import { useBranding } from '@/components/BrandingProvider'
import { useEffect, useState } from 'react'

export default function BrandingDebug() {
  const { branding } = useBranding()
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs z-50">
      <h3 className="font-bold mb-2">🔍 Branding Debug</h3>
      <div className="space-y-1">
        <div><strong>Company:</strong> {branding.companyName}</div>
        <div><strong>Hero Title:</strong> {branding.heroTitle}</div>
        <div><strong>Contact:</strong> {branding.contactEmail}</div>
        <div><strong>Primary Color:</strong> {branding.primaryColor}</div>
        <div><strong>Show Features:</strong> {String(branding.showFeatures)}</div>
        <div><strong>Show Stats:</strong> {String(branding.showStats)}</div>
      </div>
    </div>
  )
}
