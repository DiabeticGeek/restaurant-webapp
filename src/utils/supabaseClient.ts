import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export type Profile = {
  id: string
  created_at: string
  email: string
  role: 'owner' | 'server' | 'kitchen' | 'bar'
  restaurant_id: string
  name?: string
}

export type Restaurant = {
  id: string
  created_at: string
  name: string
  owner_id: string
  primary_color: string
  secondary_color: string
  tax_rate: number
}

export type TableLayout = {
  id: string
  created_at: string
  restaurant_id: string
  name: string
  layout_data: any // JSON data for layout
}

export type MenuItem = {
  id: string
  created_at: string
  restaurant_id: string
  category_id: string
  name: string
  description?: string
  price: number
  cost: number
  active: boolean
  destination: 'kitchen' | 'bar'
}

export type MenuCategory = {
  id: string
  created_at: string
  restaurant_id: string
  parent_category_id?: string
  name: string
  order: number
}

export type Order = {
  id: string
  created_at: string
  restaurant_id: string
  table_id: string
  server_id: string
  status: 'active' | 'completed' | 'cancelled'
  total_amount: number
  tax_amount: number
  tip_amount?: number
}

export type OrderItem = {
  id: string
  created_at: string
  order_id: string
  menu_item_id: string
  quantity: number
  notes?: string
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  destination: 'kitchen' | 'bar'
}

export type LayoutItem = {
  id: string
  type: 'table' | 'chair' | 'bar' | 'wall' | 'door' | 'other'
  shape: 'rectangle' | 'circle' | 'oval'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  name: string
  capacity?: number
  color?: string
}

export type Layout = {
  id: string
  name: string
  gridSize: {
    width: number
    height: number
  }
  items: LayoutItem[]
}
