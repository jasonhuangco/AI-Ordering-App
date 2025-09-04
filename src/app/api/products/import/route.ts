import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { createProduct } from '../../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface ProductImportRow {
  name: string
  description: string
  category: string
  price: string
  unit: string
  is_global?: string
  is_active?: string
}

// Validate and parse CSV row
function validateProductRow(row: ProductImportRow, lineNumber: number) {
  const errors: string[] = []
  
  if (!row.name?.trim()) {
    errors.push(`Line ${lineNumber}: Name is required`)
  }
  
  if (!row.description?.trim()) {
    errors.push(`Line ${lineNumber}: Description is required`)
  }
  
  if (!row.category?.trim()) {
    errors.push(`Line ${lineNumber}: Category is required`)
  }
  
  const validCategories = ['WHOLE_BEANS', 'ESPRESSO', 'RETAIL_PACKS', 'ACCESSORIES']
  if (row.category && !validCategories.includes(row.category.toUpperCase())) {
    errors.push(`Line ${lineNumber}: Category must be one of: ${validCategories.join(', ')}`)
  }
  
  if (!row.price?.trim()) {
    errors.push(`Line ${lineNumber}: Price is required`)
  } else {
    const price = parseFloat(row.price)
    if (isNaN(price) || price < 0) {
      errors.push(`Line ${lineNumber}: Price must be a valid positive number`)
    }
  }
  
  if (!row.unit?.trim()) {
    errors.push(`Line ${lineNumber}: Unit is required`)
  }
  
  return errors
}

// Parse CSV text into rows
function parseCSV(csvText: string): ProductImportRow[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row')
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const requiredHeaders = ['name', 'description', 'category', 'price', 'unit']
  
  // Check for required headers
  for (const required of requiredHeaders) {
    if (!headers.some(h => h.toLowerCase() === required.toLowerCase())) {
      throw new Error(`Missing required header: ${required}`)
    }
  }
  
  const rows: ProductImportRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header.toLowerCase()] = values[index] || ''
    })
    
    rows.push(row as ProductImportRow)
  }
  
  return rows
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      )
    }
    
    const csvText = await file.text()
    
    // Parse CSV
    let rows: ProductImportRow[]
    try {
      rows = parseCSV(csvText)
    } catch (error) {
      return NextResponse.json(
        { error: `CSV parsing error: ${error}` },
        { status: 400 }
      )
    }
    
    // Validate all rows first
    const allErrors: string[] = []
    const validRows: ProductImportRow[] = []
    
    rows.forEach((row, index) => {
      const lineNumber = index + 2 // +2 because index is 0-based and we skip header
      const errors = validateProductRow(row, lineNumber)
      
      if (errors.length > 0) {
        allErrors.push(...errors)
      } else {
        validRows.push(row)
      }
    })
    
    if (allErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation errors found',
          details: allErrors 
        },
        { status: 400 }
      )
    }
    
    // Import valid products
    const importResults = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }
    
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      const lineNumber = i + 2
      
      try {
        await createProduct({
          name: row.name.trim(),
          description: row.description.trim(),
          category: row.category.toUpperCase().trim(),
          price: parseFloat(row.price),
          unit: row.unit.trim(),
          is_global: row.is_global ? row.is_global.toLowerCase() === 'true' : true,
          is_active: row.is_active ? row.is_active.toLowerCase() === 'true' : true
        })
        
        importResults.successful++
      } catch (error) {
        importResults.failed++
        importResults.errors.push(`Line ${lineNumber}: Failed to create product - ${error}`)
      }
    }
    
    return NextResponse.json({
      message: 'Import completed',
      results: importResults,
      summary: `Successfully imported ${importResults.successful} products. ${importResults.failed} failed.`
    })
    
  } catch (error) {
    console.error('Error importing products:', error)
    return NextResponse.json(
      { error: 'Failed to import products', details: error },
      { status: 500 }
    )
  }
}
