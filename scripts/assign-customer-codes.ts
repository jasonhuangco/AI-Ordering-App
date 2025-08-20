#!/usr/bin/env tsx

import { assignCustomerCodes } from '../src/lib/customerCodeUtils'

async function main() {
  console.log('🏷️  Assigning customer codes...')
  
  try {
    const result = await assignCustomerCodes()
    console.log('✅', result.message)
    
    if (result.codesAssigned) {
      console.log(`📊 Codes ${result.startingCode} to ${result.endingCode} assigned`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
