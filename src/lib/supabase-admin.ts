import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

// Server-side Supabase client with service role key (for API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables')
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper functions to replace Prisma queries

// Users
export const getUserById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows found"
  return data
}

export const createUser = async (userData: {
  id: string
  email: string
  role?: 'ADMIN' | 'CUSTOMER'
  company_name?: string
  contact_name?: string
  phone?: string
  address?: string
}) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      ...userData,
      role: userData.role || 'CUSTOMER',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateUser = async (id: string, updates: any) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteUser = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Products
export const getAllProducts = async () => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) throw error
  
  // Convert snake_case to camelCase for frontend
  const formattedProducts = data?.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    unit: product.unit,
    isGlobal: product.is_global,
    isActive: product.is_active,
    imageUrl: product.image_url,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  })) || []
  
  return formattedProducts
}

export const getProductById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  // Convert snake_case to camelCase for frontend
  const formattedProduct = {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    isGlobal: data.is_global,
    isActive: data.is_active,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
  
  return formattedProduct
}

export const createProduct = async (productData: any) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      ...productData,
      is_active: productData.is_active ?? true,
      is_global: productData.is_global ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateProduct = async (id: string, updates: any) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Orders
export const getOrdersByUserId = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      users!inner(id, email, company_name, contact_name, customer_code),
      order_items (
        *,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Convert field names from snake_case to camelCase
  const formattedOrders = (data || []).map(order => ({
    id: order.id,
    userId: order.user_id,
    sequenceNumber: order.sequence_number,
    total: order.total_amount, // This is the key fix!
    status: order.status,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    user: {
      id: order.users.id,
      email: order.users.email,
      companyName: order.users.company_name,
      contactName: order.users.contact_name,
      customerCode: order.users.customer_code
    },
    items: order.order_items?.map((item: any) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      product: item.products ? {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        category: item.products.category,
        unit: item.products.unit,
        price: item.products.price,
        isGlobal: item.products.is_global,
        isActive: item.products.is_active,
        imageUrl: item.products.image_url,
        createdAt: item.products.created_at,
        updatedAt: item.products.updated_at
      } : null
    })) || []
  }))
  
  return formattedOrders
}

// Get all orders (for admin)
export const getAllOrders = async (options?: {
  limit?: number
  offset?: number
  userId?: string
}) => {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      users!inner(id, email, company_name, contact_name, customer_code),
      order_items (
        *,
        products (*)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (options?.userId) {
    query = query.eq('user_id', options.userId)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  // Convert field names from snake_case to camelCase
  const formattedOrders = (data || []).map(order => ({
    id: order.id,
    userId: order.user_id,
    sequenceNumber: order.sequence_number,
    total: order.total_amount, // This is the key fix!
    status: order.status,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    user: order.users ? {
      id: order.users.id,
      email: order.users.email,
      companyName: order.users.company_name,
      contactName: order.users.contact_name,
      customerCode: order.users.customer_code
    } : null,
    items: order.order_items?.map((item: any) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      product: item.products ? {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        category: item.products.category,
        unit: item.products.unit,
        price: item.products.price,
        isGlobal: item.products.is_global,
        isActive: item.products.is_active,
        imageUrl: item.products.image_url,
        createdAt: item.products.created_at,
        updatedAt: item.products.updated_at
      } : null
    })) || []
  }))
  
  return formattedOrders
}

export const createOrder = async (orderData: {
  user_id: string
  total_amount: number
  status?: string
  notes?: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
}) => {
  // Get the next sequence number
  const { data: lastOrder } = await supabaseAdmin
    .from('orders')
    .select('sequence_number')
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single()
  
  const nextSequenceNumber = (lastOrder?.sequence_number || 0) + 1
  
  // Start a transaction
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      sequence_number: nextSequenceNumber,
      total_amount: orderData.total_amount,
      status: orderData.status || 'PENDING',
      notes: orderData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (orderError) throw orderError
  
  // Insert order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price
  }))
  
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems)
    .select()
  
  if (itemsError) throw itemsError
  
  return { ...order, items }
}

// Branding
export const getBrandingSettings = async () => {
  const { data, error } = await supabaseAdmin
    .from('branding_settings')
    .select('*')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const updateBrandingSettings = async (updates: any) => {
  // Check if branding settings exist
  const existing = await getBrandingSettings()
  
  if (existing) {
    // Update existing record
    const { data, error } = await supabaseAdmin
      .from('branding_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } else {
    // Create new record
    const { data, error } = await supabaseAdmin
      .from('branding_settings')
      .insert({
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Favorites
export const getUserFavorites = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select(`
      *,
      products (*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data || []
}

export const addFavorite = async (userId: string, productId: string) => {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .insert({
      user_id: userId,
      product_id: productId,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Sequence management for orders
export const getNextOrderSequence = async () => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('sequence_number')
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows found"
  
  return (data?.sequence_number || 0) + 1
}

// Get all users (for admin)
export const getAllUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get customers only
export const getAllCustomers = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('role', 'CUSTOMER')
    .order('company_name', { ascending: true })
  
  if (error) throw error
  
  // Convert snake_case to camelCase for frontend
  const formattedCustomers = data?.map(customer => ({
    id: customer.id,
    email: customer.email,
    companyName: customer.company_name,
    contactName: customer.contact_name,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
    isActive: customer.is_active,
    createdAt: customer.created_at
  })) || []
  
  return formattedCustomers
}

// Customer product assignments
export const getCustomerProducts = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('customer_products')
    .select(`
      *,
      products (*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
  
  if (error) throw error
  return data || []
}

export const assignProductsToCustomer = async (userId: string, productIds: string[], customPrices: Record<string, number> = {}) => {
  const assignments = productIds.map(productId => ({
    user_id: userId,
    product_id: productId,
    custom_price: customPrices[productId] || null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  const { data, error } = await supabaseAdmin
    .from('customer_products')
    .insert(assignments)
    .select()
  
  if (error) throw error
  return data
}

export const removeProductAssignment = async (userId: string, productId: string) => {
  const { error } = await supabaseAdmin
    .from('customer_products')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  
  if (error) throw error
  return true
}

export const removeFavorite = async (userId: string, productId: string) => {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  
  if (error) throw error
  return true
}

// Admin statistics
export const getAdminStats = async () => {
  // Get total orders count
  const { count: totalOrders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
  
  if (ordersError) throw ordersError
  
  // Get total revenue
  const { data: revenueData, error: revenueError } = await supabaseAdmin
    .from('orders')
    .select('total_amount')
    .eq('status', 'SHIPPED') // Only count shipped orders for revenue
  
  if (revenueError) throw revenueError
  
  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  
  // Get active customers count
  const { count: activeCustomers, error: customersError } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'CUSTOMER')
    .eq('is_active', true)
  
  if (customersError) throw customersError
  
  // Get active products count
  const { count: totalProducts, error: productsError } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  if (productsError) throw productsError
  
  return {
    totalOrders: totalOrders || 0,
    totalRevenue,
    totalCustomers: activeCustomers || 0,
    totalProducts: totalProducts || 0
  }
}

// Get products visible to a specific customer (global products + assigned products)
export const getCustomerVisibleProducts = async (userId: string) => {
  try {
    // Get all global products that are active
    const { data: globalProducts, error: globalError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_global', true)
      .eq('is_active', true)
    
    if (globalError) throw globalError

    // Get customer-specific assigned products that are active
    const { data: assignedProducts, error: assignedError } = await supabaseAdmin
      .from('customer_products')
      .select(`
        custom_price,
        products (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (assignedError) throw assignedError

    // Convert assigned products to the same format as global products
    const assignedProductsFormatted = assignedProducts?.map(assignment => ({
      ...assignment.products,
      custom_price: assignment.custom_price // Include custom pricing if available
    })) || []

    // Combine global and assigned products, removing duplicates
    const allProducts = [...(globalProducts || []), ...assignedProductsFormatted]
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    )

    // Convert field names from snake_case to camelCase
    const formattedProducts = uniqueProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      price: product.custom_price || product.price, // Use custom price if available
      isGlobal: product.is_global,
      isActive: product.is_active,
      imageUrl: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }))

    return formattedProducts
  } catch (error) {
    console.error('Error fetching customer visible products:', error)
    throw error
  }
}
