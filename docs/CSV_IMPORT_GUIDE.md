# CSV Product Import Guide

## Overview
The CSV import feature allows you to bulk import products into your coffee ordering system. This is useful for adding many products at once or migrating from another system.

## CSV Format Requirements

### Required Columns
Your CSV file must include these columns (column order doesn't matter):

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| `name` | Product name | "Ethiopian Single Origin" | ✅ Yes |
| `description` | Product description | "Premium single origin coffee beans from the highlands of Ethiopia" | ✅ Yes |
| `category` | Product category | "WHOLE_BEANS" | ✅ Yes |
| `price` | Price (decimal number) | "24.99" | ✅ Yes |
| `unit` | Unit description | "1 lb bag" | ✅ Yes |
| `is_global` | Global visibility | "true" or "false" | ❌ Optional (defaults to true) |
| `is_active` | Active status | "true" or "false" | ❌ Optional (defaults to true) |

### Category Values
The `category` field must be one of these exact values (case-insensitive):
- `WHOLE_BEANS` - Whole coffee beans
- `ESPRESSO` - Espresso-specific products
- `RETAIL_PACKS` - Pre-packaged retail items
- `ACCESSORIES` - Coffee accessories and equipment

### Data Format Rules
- **Prices**: Use decimal format (e.g., "19.99" not "$19.99")
- **Boolean fields**: Use "true" or "false" (not "yes/no" or "1/0")
- **Text fields**: Can contain quotes, but wrap in double quotes if they contain commas
- **Encoding**: Use UTF-8 encoding for special characters

## Sample CSV File

A sample CSV file is available at `/sample-products-import.csv` with 10 example products showing the correct format.

## Import Process

1. **Prepare your CSV file** following the format above
2. **Click "Import CSV"** button on the Products page
3. **Select your file** using the file picker
4. **Review the format requirements** displayed in the modal
5. **Click "Import Products"** to start the import
6. **Review results** - successful and failed imports will be shown

## Error Handling

The import process validates each row before importing. Common errors include:

- **Missing required fields**: Name, description, category, price, or unit
- **Invalid category**: Category not in the allowed list
- **Invalid price**: Price is not a number or is negative
- **Invalid boolean values**: is_global or is_active not "true" or "false"

If any rows have errors, the import will show:
- ✅ Number of successful imports
- ❌ Number of failed imports  
- 📝 List of specific errors with line numbers

## Best Practices

1. **Test with small batches** first (5-10 products)
2. **Validate your data** before import
3. **Use the sample file** as a template
4. **Backup existing data** before large imports
5. **Check results** after import and verify products appear correctly

## File Size Limits

- Maximum file size: 10MB
- Recommended: Up to 1000 products per import
- For larger imports, split into multiple files

## Troubleshooting

### Common Issues:
- **"CSV parsing error"**: Check for proper comma separation and quote escaping
- **"Missing required header"**: Ensure all required column names are present
- **"Category must be one of..."**: Use exact category values listed above
- **"Price must be a valid positive number"**: Remove currency symbols, use decimal format

### Getting Help:
- Download and examine the sample CSV file
- Check the browser console for detailed error messages
- Ensure your CSV editor (Excel, Google Sheets) exports proper CSV format

## Technical Notes

- Imports are processed server-side for security
- Each product is validated individually
- Existing products are not updated (only new products added)
- Import results are displayed in real-time
- Failed imports don't affect successful ones
