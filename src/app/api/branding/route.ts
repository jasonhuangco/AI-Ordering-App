import { NextResponse } from 'next/server'
import { getBrandingSettings } from '../../../lib/supabase-admin'

// Convert database snake_case to frontend camelCase
function convertToFrontendFormat(dbSettings: any) {
  if (!dbSettings) return null
  
  return {
    companyName: dbSettings.company_name || 'Roaster Ordering v1',
    primaryColor: dbSettings.primary_color || '#8B4513',
    secondaryColor: dbSettings.secondary_color || '#D2B48C',
    accentColor: dbSettings.accent_color || '#DAA520',
    backgroundColor: dbSettings.background_color || '#F5F5DC',
    buttonColor: dbSettings.button_color || '#8B4513',
    logoText: dbSettings.company_name || 'Roaster Ordering v1', // Use company name as logo text
    logoUrl: dbSettings.logo_url || null,
    tagline: dbSettings.tagline || 'Premium Wholesale Coffee',
    fontFamily: dbSettings.font_family || 'Inter',
    theme: dbSettings.theme || 'light',
    heroTitle: dbSettings.hero_title || 'Wholesale Coffee Ordering',
    heroSubtitle: dbSettings.hero_subtitle || 'Made Simple',
    heroDescription: dbSettings.hero_description || 'Streamline your weekly coffee orders with our intuitive platform.',
    showStats: dbSettings.show_stats ?? true,
    showFeatures: dbSettings.show_features ?? true,
    contactEmail: dbSettings.contact_email || 'support@roasterordering.com',
    contactPhone: dbSettings.contact_phone || '1-800-ROASTER'
  }
}

// Default branding settings
const defaultBranding = {
  companyName: 'Roaster Ordering v1',
  primaryColor: '#8B4513',
  secondaryColor: '#D2B48C',
  accentColor: '#DAA520',
  backgroundColor: '#F5F5DC',
  buttonColor: '#8B4513',
  logoText: 'Roaster Ordering v1',
  logoUrl: null,
  tagline: 'Premium Wholesale Coffee',
  fontFamily: 'Inter',
  theme: 'light',
  heroTitle: 'Wholesale Coffee Ordering',
  heroSubtitle: 'Made Simple',
  heroDescription: 'Streamline your weekly coffee orders with our intuitive platform.',
  showStats: true,
  showFeatures: true,
  contactEmail: 'support@roasterordering.com',
  contactPhone: '1-800-ROASTER'
}

// Public API endpoint - no authentication required
export async function GET() {
  try {
    const brandingSettings = await getBrandingSettings()
    
    if (brandingSettings) {
      const frontendSettings = convertToFrontendFormat(brandingSettings)
      return NextResponse.json(frontendSettings)
    } else {
      // Return default settings if none found
      return NextResponse.json(defaultBranding)
    }
  } catch (error) {
    console.error('Error fetching branding settings:', error)
    // Return default settings on error
    return NextResponse.json(defaultBranding)
  }
}
