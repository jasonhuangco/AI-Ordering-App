# Admin Settings Documentation

## Overview
The Admin Settings page provides a comprehensive interface for managing system configuration, including order reminders and appearance customization.

## Features

### 1. Order Reminders
- Configure weekly reminder notifications for customers
- Set day of week and time for automated reminders
- Toggle email and SMS notification channels
- Real-time status monitoring

### 2. Appearance & Branding
The branding system allows you to customize the visual appearance of your application:

#### Company Information
- **Company Name**: Displayed throughout the application
- **Logo Text**: Text shown in the logo component
- **Tagline**: Subtitle or slogan displayed with your brand

#### Color Scheme
Choose from preset color schemes or customize individual colors:

**Preset Options:**
- **Classic Coffee**: Traditional coffee shop colors (#8B4513, #D2B48C, #DAA520)
- **Dark Roast**: Rich, deep tones (#4A2C17, #8B4513, #CD853F)
- **Modern Blue**: Contemporary blue palette (#2563EB, #60A5FA, #F59E0B)
- **Forest Green**: Natural, earthy greens (#059669, #6EE7B7, #F59E0B)

**Custom Colors:**
- **Primary Color**: Main brand color used for headers, buttons, and key elements
- **Secondary Color**: Supporting color for backgrounds and subtle elements
- **Accent Color**: Highlight color for interactive elements and calls-to-action

#### Typography
- **Font Family Options:**
  - Inter: Modern, clean sans-serif (default)
  - Playfair Display: Elegant serif for premium feel
  - Montserrat: Clean and professional sans-serif
  - Open Sans: Highly readable sans-serif
  - Dancing Script: Elegant script font for special occasions

- **Theme Mode**: Light or dark theme support (coming soon)

### 3. System Status
Monitor the health and configuration of system services:
- Database connectivity
- Email service status
- SMS service status
- Reminder system status
- Last reminder sent
- Next scheduled reminder

## Usage Instructions

### Accessing Settings
1. Log in as an administrator
2. Navigate to Admin Dashboard
3. Click "Settings" in the sidebar

### Changing Brand Colors
1. Go to the "Appearance & Branding" tab
2. Either select a preset color scheme or customize individual colors
3. Use the color pickers or enter hex values directly
4. Preview changes in the live preview section
5. Click "Apply Branding Changes" to save

### Setting Up Reminders
1. Go to the "Order Reminders" tab
2. Toggle reminder status to active
3. Select the day of week for reminders
4. Choose the time of day
5. Enable email and/or SMS notifications
6. Click "Save Reminder Settings"

## Technical Notes

### API Endpoints
- `GET/POST /api/admin/branding-settings` - Manage branding configuration
- `GET/POST /api/admin/reminder-settings` - Manage reminder settings

### Color System
The application uses CSS custom properties that can be dynamically updated:
- `--color-primary`
- `--color-secondary`
- `--color-accent`

### Font Loading
Fonts are loaded from Google Fonts and applied dynamically using CSS font-family properties.

## Troubleshooting

### Settings Not Saving
- Ensure you're logged in as an administrator
- Check browser console for error messages
- Verify internet connectivity

### Colors Not Updating
- Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache if needed
- Ensure hex color values are valid (start with #)

### Reminders Not Working
- Check system status in the "System Status" tab
- Verify email/SMS services are configured
- Ensure reminder status is set to "Active"

## Support
For technical support or feature requests, contact your system administrator.
