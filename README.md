# Coffee Ordering Application

A modern Next.js wholesale coffee ordering application with customer and admin portals.

## Features

### Customer Portal
- Browse coffee products by category
- Add items to cart and place orders
- View order history and status
- Save favorite products
- Repeat previous orders
- Mobile-first responsive design

### Admin Dashboard
- Manage products and inventory
- View and process customer orders
- Manage customer accounts
- Customizable branding and settings
- Order analytics and reporting

## Tech Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with custom coffee-themed colors
- **APIs**: Next.js API routes for REST endpoints

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and other environment variables.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

See `.env.example` for required environment variables including:
- Supabase configuration
- NextAuth settings
- Email/SMS service credentials (optional)

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

For Vercel deployment:
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

## License

Private project - All rights reserved.
