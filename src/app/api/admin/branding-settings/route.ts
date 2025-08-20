import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { getBrandingSettings, updateBrandingSettings } from '../../../../lib/supabase-admin'

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow both admin and customer users to read branding settings
    // Customers need this for proper branding display
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const brandingSettings = await getBrandingSettings()
    const frontendSettings = convertToFrontendFormat(brandingSettings)

    return NextResponse.json(frontendSettings)
  } catch (error) {
    console.error('Error fetching branding settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 Branding settings PUT request received')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('📝 Received branding data:', data)
    
    // Map frontend camelCase fields to database snake_case fields
    const fieldMapping: Record<string, string> = {
      companyName: 'company_name',
      primaryColor: 'primary_color',
      secondaryColor: 'secondary_color',
      accentColor: 'accent_color',
      backgroundColor: 'background_color',
      buttonColor: 'button_color',
      logoUrl: 'logo_url',
      fontFamily: 'font_family',
      heroTitle: 'hero_title',
      heroSubtitle: 'hero_subtitle',
      heroDescription: 'hero_description',
      showStats: 'show_stats',
      showFeatures: 'show_features',
      contactEmail: 'contact_email',
      contactPhone: 'contact_phone'
    }

    const updateData: any = {}
    
    // Handle direct snake_case fields
    const directFields = ['tagline', 'theme', 'logo_url']
    for (const field of directFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    
    // Handle mapped camelCase to snake_case fields
    for (const [camelCase, snakeCase] of Object.entries(fieldMapping)) {
      if (data[camelCase] !== undefined) {
        updateData[snakeCase] = data[camelCase]
      }
    }
    
    console.log('🔄 Processing update data:', updateData)

    const brandingSettings = await updateBrandingSettings(updateData)
    console.log('✅ Branding settings updated successfully')

    // Convert the response back to camelCase for frontend
    const responseSettings = convertToFrontendFormat(brandingSettings)

    return NextResponse.json({
      success: true,
      message: 'Branding settings updated successfully',
      settings: responseSettings
    })
  } catch (error) {
    console.error('Error updating branding settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST handler (alias for PUT for backward compatibility)
export async function POST(request: NextRequest) {
  return PUT(request)
}
