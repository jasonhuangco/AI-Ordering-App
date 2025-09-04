// Utility functions for role-based price visibility

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

/**
 * Determines if a user role can see prices for products
 * @param role - The user's role
 * @param product - The product object (optional, for product-specific hide_prices flag)
 * @returns boolean - true if user can see prices
 */
export const canUserSeePrices = (role: UserRole, product?: { hidePrices?: boolean }): boolean => {
  // ADMIN and MANAGER can always see all prices
  if (role === 'ADMIN' || role === 'MANAGER') {
    return true
  }
  
  // EMPLOYEE cannot see prices if product has hidePrices flag set
  if (role === 'EMPLOYEE') {
    return !product?.hidePrices
  }
  
  // Default to hiding prices for unknown roles
  return false
}

/**
 * Determines if any items in a collection have hidden prices for the user
 * @param role - The user's role
 * @param items - Array of items with product information
 * @returns boolean - true if any items have hidden prices
 */
export const hasHiddenPricesForUser = (
  role: UserRole, 
  items: Array<{ product: { hidePrices?: boolean } }>
): boolean => {
  if (role === 'ADMIN' || role === 'MANAGER') {
    return false // Admins and managers can always see prices
  }
  
  return items.some(item => item.product.hidePrices)
}

/**
 * Formats a price display based on user role and product settings
 * @param role - The user's role
 * @param price - The price to display
 * @param product - The product object
 * @returns string - Formatted price or alternative text
 */
export const formatPriceForUser = (
  role: UserRole,
  price: number | null,
  product: { hidePrices?: boolean; unit?: string }
): string => {
  if (canUserSeePrices(role, product) && price !== null) {
    return `$${price.toFixed(2)}`
  }
  
  return product.unit ? `Unit: ${product.unit}` : 'Custom Pricing'
}

/**
 * Gets the display text for totals based on user role
 * @param role - The user's role
 * @param total - The total amount
 * @param hasHiddenItems - Whether there are hidden price items
 * @returns string - Formatted total or alternative text
 */
export const formatTotalForUser = (
  role: UserRole,
  total: number,
  hasHiddenItems: boolean
): string => {
  if (role === 'ADMIN' || role === 'MANAGER') {
    return `$${total.toFixed(2)}` // Always show totals for admins/managers
  }
  
  if (hasHiddenItems) {
    return 'Custom Pricing'
  }
  
  return `$${total.toFixed(2)}`
}
