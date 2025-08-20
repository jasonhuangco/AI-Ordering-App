/**
 * Generates a consistent order number in the format: CUST-YYMMDD-SEQ
 * @param order Order object with sequenceNumber, createdAt, and user.customerCode
 * @returns Formatted order number string
 */
export function generateOrderNumber(order: { 
  sequenceNumber: number;
  createdAt: string; 
  user: { customerCode?: number | null } 
}): string {
  const date = new Date(order.createdAt)
  const year = String(date.getFullYear()).slice(-2) // Last 2 digits of year
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  // Use numeric customer code (4 digits, padded with zeros) + date + global sequence number
  const customerCode = String(order.user.customerCode || 0).padStart(4, '0')
  const sequence = String(order.sequenceNumber).padStart(4, '0')
  
  return `${customerCode}-${year}${month}${day}-${sequence}`
}

/**
 * Generates order number when sequenceNumber is provided separately
 */
export function generateOrderNumberWithSequence(
  sequenceNumber: number,
  orderCreatedAt: string, 
  customerCode?: number | null
): string {
  const date = new Date(orderCreatedAt)
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  const customerCodeStr = String(customerCode || 0).padStart(4, '0')
  const sequence = String(sequenceNumber).padStart(4, '0')
  
  return `${customerCodeStr}-${year}${month}${day}-${sequence}`
}

/**
 * Legacy function for backward compatibility - now uses sequence number when available
 * @deprecated Use generateOrderNumber or generateOrderNumberWithSequence instead
 */
export function generateOrderNumberWithUserId(
  orderId: string, 
  orderCreatedAt: string, 
  userId: string,
  customerCode?: number | null,
  sequenceNumber?: number
): string {
  if (sequenceNumber) {
    return generateOrderNumberWithSequence(sequenceNumber, orderCreatedAt, customerCode);
  }
  
  // Fallback to old method if sequenceNumber not available
  const date = new Date(orderCreatedAt)
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  const customerCodeStr = String(customerCode || 0).padStart(4, '0')
  const sequence = orderId.slice(-3).toUpperCase()
  
  return `${customerCodeStr}-${year}${month}${day}-${sequence}`
}

/**
 * Alternative shorter format if needed: CID-YYMMDD-SEQ (using first 3 chars of customer ID)
 */
export function generateShortOrderNumber(order: { 
  sequenceNumber: number;
  createdAt: string; 
  user: { id: string } 
}): string {
  const date = new Date(order.createdAt)
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  const customerId = order.user.id.replace(/-/g, '').slice(0, 3).toUpperCase()
  const sequence = String(order.sequenceNumber).padStart(3, '0')
  
  return `${customerId}-${year}${month}${day}-${sequence}`
}
