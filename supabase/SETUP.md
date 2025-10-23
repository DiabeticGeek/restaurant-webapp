# Supabase Setup Guide for Restaurant Management Web App

This guide will walk you through setting up your Supabase project for the Restaurant Management Web App.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Click "New Project" and fill in the details:
   - Name: `restaurant-webapp` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the region closest to your users
3. Click "Create new project" and wait for it to be created

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to "Settings" > "API"
2. Copy the "URL" and "anon public" key
3. Create a `.env` file in your project root with these values:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 3. Set Up Authentication

1. Go to "Authentication" > "Providers"
2. Make sure "Email" is enabled
3. Configure any additional settings as needed:
   - Disable "Confirm email" if you want to simplify the signup process for testing
   - Set up custom email templates if desired

## 4. Set Up Database Schema

### Option 1: Using the SQL Editor

1. Go to "SQL Editor" in your Supabase dashboard
2. Copy the contents of the `schema.sql` file in this directory
3. Paste it into the SQL editor and run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push --db-url "your_database_connection_string"
```

## 5. Enable Realtime

1. Go to "Database" > "Replication"
2. Make sure the following tables have realtime enabled:
   - orders
   - order_items
   - tables

## 6. Set Up Storage (Optional)

If you want to allow image uploads for menu items:

1. Go to "Storage" > "Buckets"
2. Create a new bucket called "menu-images"
3. Set the bucket to public or configure appropriate policies

## 7. Add Your Supabase Keys to Netlify

When deploying to Netlify:

1. Go to your Netlify site settings > "Environment variables"
2. Add the following environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## 8. Testing Your Setup

After completing the setup:

1. Run the application locally with `npm run dev`
2. Try to register a new user account
3. Verify that the user is created in Supabase Authentication
4. Check that the corresponding profile and restaurant records are created in the database

## Troubleshooting

- **Authentication Issues**: Make sure your Supabase URL and anon key are correct in your `.env` file
- **Database Errors**: Check the SQL logs in Supabase for any errors during schema creation
- **RLS Policy Issues**: If you're getting permission denied errors, make sure the RLS policies are correctly set up

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
