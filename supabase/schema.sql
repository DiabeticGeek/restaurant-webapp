-- Create tables for the restaurant management app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'server', 'kitchen', 'bar')),
  restaurant_id UUID,
  avatar_url TEXT
);

-- Restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#10b981',
  tax_rate DECIMAL(5,2) DEFAULT 8.25
);

-- Add foreign key constraint to profiles for restaurant_id
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);

-- Table layouts
CREATE TABLE table_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  layout_data JSONB NOT NULL
);

-- Menu categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  parent_category_id UUID REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  category_id UUID REFERENCES menu_categories(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  image_url TEXT
);

-- Tables (physical tables in the restaurant)
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  layout_id UUID REFERENCES table_layouts(id) NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved')),
  position_data JSONB NOT NULL
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  table_id UUID REFERENCES tables(id) NOT NULL,
  server_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'mobile_payment'))
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  destination TEXT NOT NULL CHECK (destination IN ('kitchen', 'bar')),
  price DECIMAL(10,2) NOT NULL
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Owners can view all profiles in their restaurant" 
  ON profiles FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.role = 'owner' AND r.id = restaurant_id
    )
  );

CREATE POLICY "Owners can insert profiles for their restaurant" 
  ON profiles FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.role = 'owner' AND r.id = restaurant_id
    )
  );

CREATE POLICY "Owners can update profiles in their restaurant" 
  ON profiles FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.role = 'owner' AND r.id = restaurant_id
    )
  );

-- Restaurant policies
CREATE POLICY "Users can view their restaurant" 
  ON restaurants FOR SELECT 
  USING (
    id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their restaurant" 
  ON restaurants FOR UPDATE 
  USING (
    owner_id = auth.uid()
  );

-- Table layouts policies
CREATE POLICY "Users can view layouts for their restaurant" 
  ON table_layouts FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert layouts for their restaurant" 
  ON table_layouts FOR INSERT 
  WITH CHECK (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can update layouts for their restaurant" 
  ON table_layouts FOR UPDATE 
  USING (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- Menu categories policies
CREATE POLICY "Users can view menu categories for their restaurant" 
  ON menu_categories FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert menu categories for their restaurant" 
  ON menu_categories FOR INSERT 
  WITH CHECK (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can update menu categories for their restaurant" 
  ON menu_categories FOR UPDATE 
  USING (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- Menu items policies
CREATE POLICY "Users can view menu items for their restaurant" 
  ON menu_items FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert menu items for their restaurant" 
  ON menu_items FOR INSERT 
  WITH CHECK (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can update menu items for their restaurant" 
  ON menu_items FOR UPDATE 
  USING (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- Tables policies
CREATE POLICY "Users can view tables for their restaurant" 
  ON tables FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert tables for their restaurant" 
  ON tables FOR INSERT 
  WITH CHECK (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can update tables for their restaurant" 
  ON tables FOR UPDATE 
  USING (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Servers can update tables for their restaurant" 
  ON tables FOR UPDATE 
  USING (
    restaurant_id IN (
      SELECT r.id FROM restaurants r
      JOIN profiles p ON r.id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'server')
    )
  );

-- Orders policies
CREATE POLICY "Users can view orders for their restaurant" 
  ON orders FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Servers can insert orders for their restaurant" 
  ON orders FOR INSERT 
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Servers can update orders for their restaurant" 
  ON orders FOR UPDATE 
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Order items policies
CREATE POLICY "Users can view order items for their restaurant" 
  ON order_items FOR SELECT 
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN profiles p ON o.restaurant_id = p.restaurant_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Servers can insert order items" 
  ON order_items FOR INSERT 
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN profiles p ON o.restaurant_id = p.restaurant_id
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'server')
    )
  );

CREATE POLICY "Staff can update order items for their restaurant" 
  ON order_items FOR UPDATE 
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN profiles p ON o.restaurant_id = p.restaurant_id
      WHERE p.id = auth.uid()
    )
  );

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- Create functions and triggers for order total calculation
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(10,2);
  v_tax_rate DECIMAL(5,2);
BEGIN
  -- Get the tax rate from the restaurant
  SELECT r.tax_rate INTO v_tax_rate
  FROM orders o
  JOIN restaurants r ON o.restaurant_id = r.id
  WHERE o.id = NEW.order_id;
  
  -- Calculate the total of all order items
  SELECT COALESCE(SUM(price * quantity), 0) INTO v_total
  FROM order_items
  WHERE order_id = NEW.order_id;
  
  -- Update the order with the new total and tax
  UPDATE orders
  SET 
    total_amount = v_total,
    tax_amount = v_total * (v_tax_rate / 100),
    updated_at = NOW()
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_totals
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE PROCEDURE calculate_order_totals();

-- Create function to handle table status updates
CREATE OR REPLACE FUNCTION update_table_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When a new order is created, set the table to occupied
    IF NEW.status = 'active' THEN
      UPDATE tables SET status = 'occupied', updated_at = NOW()
      WHERE id = NEW.table_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- When an order is completed or cancelled, check if there are other active orders
    IF NEW.status IN ('completed', 'cancelled') AND OLD.status = 'active' THEN
      IF NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE table_id = NEW.table_id 
        AND status = 'active' 
        AND id != NEW.id
      ) THEN
        -- If no other active orders, set table to free
        UPDATE tables SET status = 'free', updated_at = NOW()
        WHERE id = NEW.table_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_table_status
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE PROCEDURE update_table_status();
