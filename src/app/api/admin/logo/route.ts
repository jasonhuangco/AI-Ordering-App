import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { updateBrandingSettings } from '../../../../lib/supabase-admin'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ Logo upload request received')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized logo upload attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('logo') as unknown as File

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('📁 File details:', { name: file.name, type: file.type, size: file.size })

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ error: 'Invalid file type. Please upload an image file.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'png'
    const filename = `logo-${timestamp}.${fileExtension}`
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
      console.log('📂 Upload directory ready')
    } catch (error) {
      // Directory might already exist, ignore error
      console.log('📂 Upload directory exists')
    }
    
    const filePath = join(uploadDir, filename)
    
    // Write the file
    await writeFile(filePath, new Uint8Array(buffer))
    console.log('💾 File saved:', filePath)
    
    // Update branding settings in database
    const logoUrl = `/uploads/${filename}`
    
    try {
      await updateBrandingSettings({ logo_url: logoUrl })
      console.log('✅ Logo URL updated in database:', logoUrl)
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError)
      return NextResponse.json(
        { error: 'Failed to update logo in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl 
    })
  } catch (error) {
    console.error('❌ Logo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    console.log('🗑️ Logo removal request received')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized logo removal attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove logo from branding settings
    try {
      await updateBrandingSettings({ logo_url: null })
      console.log('✅ Logo removed from database')
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError)
      return NextResponse.json(
        { error: 'Failed to remove logo from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Logo removed successfully' 
    })
  } catch (error) {
    console.error('❌ Logo removal error:', error)
    return NextResponse.json(
      { error: 'Failed to remove logo' },
      { status: 500 }
    )
  }
}
