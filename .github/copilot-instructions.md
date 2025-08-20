<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Roaster Ordering v1 - Copilot Instructions

This is a Next.js wholesale coffee ordering web application with the following architecture and conventions:

## Tech Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with custom coffee-themed colors
- **APIs**: Next.js API routes for REST endpoints

## Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/lib/` - Utility functions, database client, auth config
- `/prisma/` - Database schema and migrations
- `/src/app/api/` - API route handlers

## Color Scheme
Use these custom Tailwind colors for consistency:
- `coffee-brown` (#8B4513) - Primary brand color
- `coffee-light` (#D2B48C) - Light accent
- `coffee-dark` (#4A2C17) - Dark variant
- `cream` (#F5F5DC) - Background
- `espresso` (#3C2415) - Very dark
- `roast` (#A0522D) - Medium brown

## Database Models
- **User** - Customers and admins with authentication
- **Product** - Coffee products with categories (WHOLE_BEANS, ESPRESSO, RETAIL_PACKS, ACCESSORIES)
- **Order** - Customer orders with status tracking
- **OrderItem** - Individual items within orders
- **Favorite** - Customer saved products
- **ReminderSettings** - System-wide reminder configuration

## Key Features to Implement
1. **Customer Portal** - Product browsing, ordering, order history
2. **Admin Dashboard** - Product/customer/order management
3. **Authentication** - Role-based access (ADMIN/CUSTOMER)
4. **Reminders** - Automated email/SMS for weekly orders
5. **Mobile-First** - Responsive design optimized for mobile use

## Code Style Guidelines
- Use TypeScript with strict type checking
- Implement proper error handling in API routes
- Use Prisma for all database operations
- Follow React hooks patterns for state management
- Use NextAuth for all authentication flows
- Implement proper loading states and error boundaries

## API Patterns
- Use `getServerSession(authOptions)` for authentication in API routes
- Return appropriate HTTP status codes and error messages
- Implement proper data validation using Zod or similar
- Use consistent response formats across all endpoints

## Security Considerations
- Validate user roles before admin operations
- Hash passwords with bcryptjs
- Sanitize all user inputs
- Use environment variables for sensitive data
- Implement CSRF protection where needed
