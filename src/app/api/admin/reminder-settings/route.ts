import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('📅 Getting reminder settings...')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if reminder settings exist, create default if not
    const { data: settings, error } = await supabaseAdmin
      .from('reminder_settings')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // No settings found, create default
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('reminder_settings')
        .insert({
          day_of_week: 1, // Monday
          hour: 9, // 9 AM
          is_active: false,
          email_enabled: true,
          sms_enabled: false,
        })
        .select('*')
        .single()
      
      if (createError) {
        console.error('❌ Error creating default settings:', createError)
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 })
      }
      
      // Convert to frontend format
      const formattedSettings = {
        id: newSettings.id,
        dayOfWeek: newSettings.day_of_week,
        hour: newSettings.hour,
        timezone: newSettings.timezone || 'America/Los_Angeles',
        isActive: newSettings.is_active,
        emailEnabled: newSettings.email_enabled,
        smsEnabled: newSettings.sms_enabled,
        createdAt: newSettings.created_at,
        updatedAt: newSettings.updated_at
      }
      
      return NextResponse.json(formattedSettings)
    }
    
    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Convert to frontend format
    const formattedSettings = {
      id: settings.id,
      dayOfWeek: settings.day_of_week,
      hour: settings.hour,
      timezone: settings.timezone || 'America/Los_Angeles',
      isActive: settings.is_active,
      emailEnabled: settings.email_enabled,
      smsEnabled: settings.sms_enabled,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error('❌ Error fetching reminder settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📅 Updating reminder settings...')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Find existing settings
    const { data: existingSettings, error: fetchError } = await supabaseAdmin
      .from('reminder_settings')
      .select('*')
      .limit(1)
      .single()
    
    let settings
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // No settings exist, create new
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('reminder_settings')
        .insert({
          day_of_week: data.dayOfWeek ?? 1,
          hour: data.hour ?? 9,
          timezone: data.timezone ?? 'America/Los_Angeles',
          is_active: data.isActive ?? false,
          email_enabled: data.emailEnabled ?? true,
          sms_enabled: data.smsEnabled ?? false,
        })
        .select('*')
        .single()
      
      if (createError) {
        console.error('❌ Error creating settings:', createError)
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 })
      }
      
      settings = newSettings
    } else if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    } else {
      // Update existing settings
      const { data: updatedSettings, error: updateError } = await supabaseAdmin
        .from('reminder_settings')
        .update({
          day_of_week: data.dayOfWeek ?? existingSettings.day_of_week,
          hour: data.hour ?? existingSettings.hour,
          timezone: data.timezone ?? existingSettings.timezone ?? 'America/Los_Angeles',
          is_active: data.isActive ?? existingSettings.is_active,
          email_enabled: data.emailEnabled ?? existingSettings.email_enabled,
          sms_enabled: data.smsEnabled ?? existingSettings.sms_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select('*')
        .single()
      
      if (updateError) {
        console.error('❌ Error updating settings:', updateError)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
      }
      
      settings = updatedSettings
    }

    // Convert to frontend format
    const formattedSettings = {
      id: settings.id,
      dayOfWeek: settings.day_of_week,
      hour: settings.hour,
      timezone: settings.timezone || 'America/Los_Angeles',
      isActive: settings.is_active,
      emailEnabled: settings.email_enabled,
      smsEnabled: settings.sms_enabled,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at
    }

    console.log('✅ Reminder settings updated successfully')
    return NextResponse.json({
      success: true,
      message: 'Reminder settings updated successfully',
      data: formattedSettings
    })
  } catch (error) {
    console.error('❌ Error updating reminder settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
