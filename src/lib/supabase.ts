import { createClient } from '@supabase/supabase-js'

// Next.js environment variables (not Vite)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// Types for the database schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'ADMIN' | 'CUSTOMER'
          customer_code: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          company_name: string | null
          contact_name: string | null
          phone: string | null
          address: string | null
          notes: string | null
        }
        Insert: {
          id: string
          email: string
          role?: 'ADMIN' | 'CUSTOMER'
          customer_code?: number | null
          is_active?: boolean
          company_name?: string | null
          contact_name?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
        }
        Update: {
          email?: string
          role?: 'ADMIN' | 'CUSTOMER'
          customer_code?: number | null
          is_active?: boolean
          company_name?: string | null
          contact_name?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          category: 'WHOLE_BEANS' | 'ESPRESSO' | 'RETAIL_PACKS' | 'ACCESSORIES'
          price: number
          unit: string
          is_active: boolean
          is_global: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description: string
          category: 'WHOLE_BEANS' | 'ESPRESSO' | 'RETAIL_PACKS' | 'ACCESSORIES'
          price: number
          unit: string
          is_active?: boolean
          is_global?: boolean
        }
        Update: {
          name?: string
          description?: string
          category?: 'WHOLE_BEANS' | 'ESPRESSO' | 'RETAIL_PACKS' | 'ACCESSORIES'
          price?: number
          unit?: string
          is_active?: boolean
          is_global?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          sequence_number: number
          status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          sequence_number?: number
          status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED'
          total_amount: number
          notes?: string | null
        }
        Update: {
          status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED'
          total_amount?: number
          notes?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      customer_products: {
        Row: {
          id: string
          user_id: string
          product_id: string
          custom_price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          product_id: string
          custom_price?: number | null
          is_active?: boolean
        }
        Update: {
          custom_price?: number | null
          is_active?: boolean
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: string
        }
        Update: never
      }
      branding_settings: {
        Row: {
          id: string
          company_name: string
          logo_url: string | null
          tagline: string
          primary_color: string
          secondary_color: string
          accent_color: string
          background_color: string
          button_color: string
          font_family: string
          theme: string
          hero_title: string
          hero_subtitle: string
          hero_description: string
          contact_email: string
          contact_phone: string
          show_features: boolean
          show_stats: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          company_name?: string
          logo_url?: string | null
          tagline?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          background_color?: string
          button_color?: string
          font_family?: string
          theme?: string
          hero_title?: string
          hero_subtitle?: string
          hero_description?: string
          contact_email?: string
          contact_phone?: string
          show_features?: boolean
          show_stats?: boolean
        }
        Update: {
          company_name?: string
          logo_url?: string | null
          tagline?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          background_color?: string
          button_color?: string
          font_family?: string
          theme?: string
          hero_title?: string
          hero_subtitle?: string
          hero_description?: string
          contact_email?: string
          contact_phone?: string
          show_features?: boolean
          show_stats?: boolean
        }
      }
    }
  }
}
