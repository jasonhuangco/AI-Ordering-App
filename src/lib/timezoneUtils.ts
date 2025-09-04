/**
 * Timezone utilities for reminder scheduling
 */

/**
 * Convert a time from a specific timezone to UTC
 * @param hour - Hour in 24-hour format (0-23)
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, etc.)
 * @param timezone - IANA timezone string (e.g., 'America/Los_Angeles')
 * @returns Object with UTC hour and day, accounting for timezone offset
 */
export function convertToUTC(hour: number, dayOfWeek: number, timezone: string) {
  // Create a date object for the current week on the specified day and time
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday
  
  // Calculate days until the target day
  let daysUntil = dayOfWeek - currentDay
  if (daysUntil < 0) {
    daysUntil += 7 // Next week
  }
  
  // Create target date in the specified timezone
  const targetDate = new Date(now)
  targetDate.setDate(targetDate.getDate() + daysUntil)
  targetDate.setHours(hour, 0, 0, 0)
  
  // Convert to the target timezone
  const targetInTimezone = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(targetDate)
  
  // Parse the formatted parts
  const year = parseInt(targetInTimezone.find(part => part.type === 'year')?.value || '2025')
  const month = parseInt(targetInTimezone.find(part => part.type === 'month')?.value || '1') - 1
  const day = parseInt(targetInTimezone.find(part => part.type === 'day')?.value || '1')
  const targetHour = parseInt(targetInTimezone.find(part => part.type === 'hour')?.value || '0')
  
  // Create a new date in the target timezone
  const timezoneDate = new Date(year, month, day, targetHour, 0, 0, 0)
  
  // Calculate the offset between local time and target timezone
  const timezoneOffset = getTimezoneOffset(timezone)
  const utcDate = new Date(timezoneDate.getTime() - (timezoneOffset * 60 * 1000))
  
  return {
    utcHour: utcDate.getUTCHours(),
    utcDay: utcDate.getUTCDay(),
    utcDate: utcDate.toISOString()
  }
}

/**
 * Get timezone offset in minutes
 * @param timezone - IANA timezone string
 * @returns Offset in minutes from UTC (positive for east of UTC, negative for west)
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date()
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  
  const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
  const utcTime = new Date(utc.toLocaleString('en-US', { timeZone: 'UTC' }))
  
  return (targetTime.getTime() - utcTime.getTime()) / (60 * 1000)
}

/**
 * Check if it's time to send a reminder based on timezone
 * @param settings - Reminder settings with timezone
 * @returns true if it's time to send the reminder
 */
export function isReminderTime(settings: {
  dayOfWeek: number
  hour: number
  timezone: string
  isActive: boolean
}): boolean {
  if (!settings.isActive) {
    return false
  }
  
  const now = new Date()
  const currentUTCHour = now.getUTCHours()
  const currentUTCDay = now.getUTCDay()
  
  // Convert target time to UTC
  const { utcHour, utcDay } = convertToUTC(settings.hour, settings.dayOfWeek, settings.timezone)
  
  // Check if current time matches the target time (within the same hour)
  return currentUTCDay === utcDay && currentUTCHour === utcHour
}

/**
 * Get a human-readable description of when the reminder will be sent
 * @param settings - Reminder settings with timezone
 * @returns String description of the schedule
 */
export function getScheduleDescription(settings: {
  dayOfWeek: number
  hour: number
  timezone: string
}): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeString = settings.hour === 0 ? '12:00 AM' : 
                    settings.hour < 12 ? `${settings.hour}:00 AM` : 
                    settings.hour === 12 ? '12:00 PM' : 
                    `${settings.hour - 12}:00 PM`
  
  const timezoneLabel = getTimezoneLabel(settings.timezone)
  
  return `${days[settings.dayOfWeek]} at ${timeString} (${timezoneLabel})`
}

/**
 * Get a human-readable timezone label
 */
export function getTimezoneLabel(timezone: string): string {
  const labels: Record<string, string> = {
    'America/Los_Angeles': 'Pacific Time',
    'America/Denver': 'Mountain Time',
    'America/Chicago': 'Central Time',
    'America/New_York': 'Eastern Time',
    'America/Phoenix': 'Arizona Time',
    'America/Anchorage': 'Alaska Time',
    'Pacific/Honolulu': 'Hawaii Time',
    'UTC': 'UTC'
  }
  
  return labels[timezone] || timezone
}

/**
 * Debug function to show what time a reminder would be sent in various timezones
 */
export function debugReminderTiming(settings: {
  dayOfWeek: number
  hour: number
  timezone: string
}) {
  console.log('🕐 Reminder Timing Debug')
  console.log('========================')
  console.log(`Configured: ${getScheduleDescription(settings)}`)
  
  const { utcHour, utcDay, utcDate } = convertToUTC(settings.hour, settings.dayOfWeek, settings.timezone)
  
  console.log(`UTC Time: ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][utcDay]} at ${utcHour}:00`)
  console.log(`UTC Date: ${utcDate}`)
  
  // Show what this would be in other common timezones
  const commonTimezones = [
    'America/Los_Angeles',
    'America/Denver', 
    'America/Chicago',
    'America/New_York',
    'UTC'
  ]
  
  console.log('\nEquivalent times:')
  commonTimezones.forEach(tz => {
    const date = new Date(utcDate)
    const localTime = date.toLocaleString('en-US', {
      timeZone: tz,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    console.log(`${getTimezoneLabel(tz)}: ${localTime}`)
  })
}
