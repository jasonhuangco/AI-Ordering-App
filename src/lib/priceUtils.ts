/**
 * Utility functions for safe number formatting
 */

export const formatPrice = (price: number | null | undefined): string => {
  const numericPrice = Number(price) || 0
  return numericPrice.toFixed(2)
}

export const safePrice = (price: number | null | undefined): number => {
  return Number(price) || 0
}

export const calculateLineTotal = (price: number | null | undefined, quantity: number): number => {
  return safePrice(price) * (quantity || 0)
}

export const formatCurrency = (amount: number | null | undefined): string => {
  return `$${formatPrice(amount)}`
}
