import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { debugReminderTiming, isReminderTime, getScheduleDescription } from '../../../../lib/timezoneUtils'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking reminder timezone settings...')
    
    // Get current reminder settings
    const { data: settings, error } = await supabaseAdmin
      .from('reminder_settings')
      .select('*')
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
    
    if (!settings) {
      return NextResponse.json({ error: 'No reminder settings found' }, { status: 404 })
    }
    
    // Debug the timing
    const reminderSettings = {
      dayOfWeek: settings.day_of_week,
      hour: settings.hour,
      timezone: settings.timezone || 'America/Los_Angeles'
    }
    
    // Log debug info to console
    debugReminderTiming(reminderSettings)
    
    // Check if it's currently reminder time
    const isCurrentlyReminderTime = isReminderTime({
      ...reminderSettings,
      isActive: settings.is_active
    })
    
    // Get current time info
    const now = new Date()
    const currentLocalTime = now.toLocaleString('en-US', {
      timeZone: reminderSettings.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    
    const currentUTC = now.toUTCString()
    
    return NextResponse.json({
      success: true,
      settings: {
        configured: getScheduleDescription(reminderSettings),
        isActive: settings.is_active,
        timezone: reminderSettings.timezone
      },
      timing: {
        currentLocalTime,
        currentUTC,
        isCurrentlyReminderTime,
        nextReminderWould: 'Check console logs for detailed timing info'
      },
      debug: {
        dayOfWeek: reminderSettings.dayOfWeek,
        hour: reminderSettings.hour,
        timezone: reminderSettings.timezone,
        currentDay: now.getDay(),
        currentHour: now.getHours(),
        currentUTCDay: now.getUTCDay(),
        currentUTCHour: now.getUTCHours()
      }
    })
    
  } catch (error) {
    console.error('❌ Error in timezone debug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
