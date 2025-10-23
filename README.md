# Restaurant Management Web App

A comprehensive web application for restaurant management, designed for owners, servers, kitchen staff, and bar staff.

## Features

- **Owner Dashboard**: Floor layout editor, menu management, analytics, and staff management
- **Server App**: Table management, order placement, bill calculation
- **Kitchen/Bar Display**: Real-time order management
- **Authentication**: Role-based access control
- **Real-time Updates**: Instant synchronization across all devices

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Hosting**: Netlify
- **Libraries**: React Router, React DND, React Query, Recharts, and more

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/restaurant-webapp.git
   cd restaurant-webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Supabase Setup

1. Create a new Supabase project
2. Enable email/password authentication
3. Create the following tables:
   - profiles (id, created_at, email, role, restaurant_id, name)
   - restaurants (id, created_at, name, owner_id, primary_color, secondary_color, tax_rate)
   - table_layouts (id, created_at, restaurant_id, name, layout_data)
   - menu_categories (id, created_at, restaurant_id, parent_category_id, name, order)
   - menu_items (id, created_at, restaurant_id, category_id, name, description, price, cost, active)
   - orders (id, created_at, restaurant_id, table_id, server_id, status, total_amount, tax_amount, tip_amount)
   - order_items (id, created_at, order_id, menu_item_id, quantity, notes, status, destination)
4. Set up Row Level Security (RLS) policies for each table
5. Enable Realtime for the orders and order_items tables

## Deployment

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set up environment variables in Netlify for Supabase credentials
4. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
