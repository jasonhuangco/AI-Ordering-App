# Production Schedule Feature - Documentation

## Overview
The Production Schedule feature provides a consolidated view of what needs to be produced across all orders within a specified time period. Instead of looking at individual customer orders, this gives you a production-focused aggregated view.

## Key Features

### 1. **Aggregated Production View**
- **Product Consolidation**: Shows total quantities needed for each product across all orders
- **Order Tracking**: See which specific orders contribute to each product requirement
- **Customer Context**: View which customers ordered each product

### 2. **Flexible Date Filtering**
- **Date Range Selection**: Choose start and end dates for your production period
- **Status Filtering**: Filter orders by status (Pending, Processing, Completed, Cancelled)
- **Archive Options**: Include or exclude archived orders

### 3. **Production Planning Tools**
- **Expandable Details**: Click to see individual orders contributing to each product
- **Bulk Actions**: Select multiple orders and update their status simultaneously
- **Category Grouping**: Visual organization by product category (Whole Beans, Espresso, Retail Packs, Accessories)

### 4. **Summary Dashboard**
- **Total Products**: Number of unique products to produce
- **Total Quantity**: Combined quantity across all products
- **Total Orders**: Number of orders in the date range
- **Category Breakdown**: Production requirements by product category

## How to Use

### **Basic Workflow**
1. **Navigate** to Admin → Production in the sidebar
2. **Set Date Range** for your production planning period
3. **Apply Filters** to focus on specific order statuses
4. **Review Summary** cards for high-level production requirements
5. **Expand Products** to see detailed order breakdowns
6. **Mark Orders** as you complete production steps

### **Production Planning Process**
1. **Weekly Planning**: Set date range for upcoming week
2. **Identify Requirements**: Review total quantities needed per product
3. **Production Scheduling**: Use order details to plan production batches
4. **Progress Tracking**: Update order statuses as production progresses
5. **Quality Control**: Mark orders complete when ready for delivery

### **Bulk Status Management**
- **Select Orders**: Use checkboxes to select individual orders or "Select All" for a product
- **Status Updates**: Bulk update selected orders to "Processing" or "Completed"
- **Progress Tracking**: Monitor production progress across multiple orders

## Use Cases

### **Daily Production Planning**
- Review today's orders to understand immediate production needs
- Identify which products require immediate attention
- Plan production batches based on total quantities

### **Weekly Batch Planning**
- Set 7-day date ranges to plan weekly production runs
- Group similar products for efficient batch processing
- Coordinate with inventory and supply planning

### **Order Fulfillment Tracking**
- Track progress from pending to processing to completed
- Update order statuses as production milestones are reached
- Maintain visibility into production pipeline

### **Resource Planning**
- Use category breakdown to plan equipment and staff needs
- Identify peak production periods requiring additional resources
- Balance production capacity across product categories

## Benefits

### **For Production Managers**
- **Consolidated View**: See total production requirements at a glance
- **Batch Efficiency**: Group similar products for optimized production runs
- **Progress Tracking**: Monitor production status across all orders

### **For Business Owners**
- **Capacity Planning**: Understand production demands over time
- **Resource Allocation**: Plan staffing and equipment needs
- **Customer Service**: Provide accurate delivery timelines

### **For Quality Control**
- **Batch Tracking**: Monitor quality across production batches
- **Status Management**: Update orders as they pass quality checkpoints
- **Documentation**: Maintain records of production completion

## API Endpoints

### **GET /api/admin/production**
**Parameters:**
- `startDate` (required): Start of production period
- `endDate` (required): End of production period  
- `status` (optional): Filter by order status
- `includeArchived` (optional): Include archived orders

**Returns:** Production schedule with aggregated product requirements

### **POST /api/admin/production**
**Body:**
- `orderIds`: Array of order IDs to update
- `status`: New status to apply to selected orders

**Returns:** Confirmation of status updates

## Integration Notes

- **Order Management**: Seamlessly integrates with existing order system
- **Customer Data**: Maintains customer context for each production requirement
- **Product Catalog**: Uses existing product information and categories
- **Status Tracking**: Works with existing order status workflow

## Best Practices

1. **Regular Updates**: Update order statuses as production progresses
2. **Date Planning**: Use appropriate date ranges for your production cycles
3. **Batch Grouping**: Group similar products for efficient production
4. **Quality Gates**: Use status updates to track quality checkpoints
5. **Customer Communication**: Use production status for customer updates

This feature transforms individual orders into actionable production plans while maintaining full traceability back to original customer requirements.
