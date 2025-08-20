// Quick script to check order sequence numbers
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, sequence_number, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error:', error)
      return
    }
    
    console.log('Recent orders:')
    data.forEach(order => {
      console.log(`ID: ${order.id.slice(-8)}, Sequence: ${order.sequence_number}, Created: ${order.created_at}`)
    })
  } catch (err) {
    console.error('Script error:', err)
  }
}

checkOrders()
