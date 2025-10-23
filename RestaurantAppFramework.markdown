# Restaurant Management Web App Development Brief
INFO:
My Goal = Build a full stack Top of the line, Grade A+ restaurantweb app, where (smaller) restaurants can manage their restaurants, all from the website. I will make it free for the first 5 users, then i will implement a stripe integration and make people pay to use the software.
My plan = My plan to build this project is as following;
Use github as storage for the code, cursor/windsurf for coding & pushing to github, Use supabase for the database, Use netlify for the deployment. So when changes are made just push to github and the changes will be deployed automatically. And eventually i will implement stripe for the payment processing. But that is for later.

Instructions;
Build a restaurant management web app for owners, servers, and staff to handle floor layouts, menus, orders, kitchen/bar displays, and analytics. You (an LLM) will generate all code, push it to GitHub, and provide Supabase setup instructions. Create a new GitHub repo called `restaurant-webapp`. we will implement via Cursor/Windsurf. Terminal has GitHub access.

## Objective
Create a secure, user-friendly app to streamline restaurant operations, accessible on phones and computers, with real-time updates and role-based access.

## Features to Build
- **Owner Dashboard**:
  - Drag-and-drop floor layout editor (tables, chairs & bar. Chair will always be round, Allow people to adjust size of everything(Tables, chairs, bar, Layout tile grid), Make the layout tile grid 500x500 standard, Make sure people can  change it to 200x500 for example, or whatever size fits. Also allow them to place square or and round tables, aswell as oval tables. Basically allow them to customize the table format and size, Same goes for bar, allow them to place it anywhere, and customize the size of the bar. Just make it as easy as possible to make their restaurant exactly the same as in real life. ). 
  - Menu editor for menus, nested categories, and items (name, price, cost), Selector for where the item will be made (Bar, Kitchen etc. defined by how many bars and kitchens there are.).
  - Analytics showing sales, item counts, costs, profits (daily, weekly, monthly, yearly).
  - Staff account management (create accounts with roles: owner, server, kitchen, bar).
- **Server App**:
  - Display floor layout with tables colored by status: gray (free), yellow (active order), red (unattended >15 min, configurable), Green (Order ready for pickup).
  - Order placement with menu selection and comments (e.g., "NO ICE").
  - Transfer items or tables to other tables.
  - Calculate bills (tax rate set by owner, optional tip).
  - Show "PICK UP" when kitchen/bar marks orders done.
- **Kitchen/Bar Display**:
  - List pending orders with item names and comments.
  - Buttons to mark orders as completed.
  - Option for combined kitchen/bar view (owner-configurable).
- **Real-Time**:
  - Instant updates for orders and statuses across all roles.
- **Authentication**:
  - Login/signup with email/password, assign roles (owner, server, kitchen, bar).
  - Restrict pages by role (e.g., only owners access dashboard).
- **UI**:
  - Make it as user friendly as possible.
  - Make it as responsive as possible.
  - Make it as accessible as possible.
  - Allow owners to setup their restaurant color in settings.
## Tech Stack
- **GitHub**: Store code in `restaurant-webapp` repo.
- **Netlify**: Host app, run serverless functions, store Supabase keys in environment variables.
- **Supabase**: PostgreSQL database, authentication, real-time updates.
- **Frontend**: React (use Vite), Tailwind CSS.
- **Libraries**: Choose as needed (e.g., `@supabase/supabase-js`, `react-router-dom`, `uuid`, `react-icons`, `react-dnd`, `recharts`, `@tanstack/react-query`).

## Instructions for LLM
1. Take a deep breath

2. **Generate Code**:
   - Create all necessary files (React components, pages, hooks, utils, Netlify functions).
   - Ensure responsive, accessible design with Tailwind CSS (ARIA labels, keyboard navigation).
   - Implement real-time updates using Supabase subscriptions.
   - Use serverless functions for tasks like order transfers, bill calculations.
   - Structure database with tables for users, menus, categories, items, orders, layouts.
   - Apply Row Level Security (RLS) for role-based access.
3. **Push to GitHub**:
   - After generating files: `git add .`, `git commit -m "Restaurant app implementation"`, `git push origin main`.
4. **Supabase Setup**:
   - Provide steps to:
     - Create Supabase project.
     - Enable email/password auth.
     - Create tables for users, menus, categories, items, orders, layouts.
     - Set up RLS policies for role-based access.
     - Enable Realtime for orders table.
     - Add Supabase URL and anon key to Netlify environment variables.
5. **Deploy on Netlify**:
   - I will add Supabase keys to Netlify environment variables.
6. **Security**:
   - Use Supabase RLS for data access control.
   - Rely on Supabase Auth for secure password handling.
   - Sanitize all user inputs.
7. **Testing**:
   - Test in production (Netlify domain).
   - Verify login/signup, menu creation, order placement, real-time updates, table status colors, and pickups.
   - Use browser dev tools and Supabase logs for debugging.

## Notes
- We can do local testing with an `.env` file, but add it to git ignore since I will use Netlify environment variables for Supabase keys in production.
- Ensure app works on mobile and desktop.
- LLM decides code details, file structure, and library usage within tech stack.