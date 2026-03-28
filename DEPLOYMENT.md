# 🚀 Vercel & Supabase Deployment Guide

Follow these steps to host **FuelSpotter NG** in production.

## 1. Database Setup (Supabase)
Before deploying the frontend, your database must be ready.

1.  Go to your [Supabase Dashboard](https://app.supabase.com/).
2.  Create a **New Project**.
3.  Open the **SQL Editor** in the left sidebar.
4.  Click **New Query** and paste the contents of the `supabase-schema.sql` file.
5.  **Run** the query. This will create the `stations`, `reports`, and `profiles` tables, along with the automated user-sync triggers.

## 2. Environment Variables
You need to provide Vercel with your Supabase credentials.

1.  In your Supabase project, go to **Project Settings** > **API**.
2.  Find the `Project URL` and `anon public` key.
3.  In your **Vercel Project Dashboard**, go to **Settings** > **Environment Variables**.
4.  Add the following two variables:
    -   `NEXT_PUBLIC_SUPABASE_URL`: (Paste your Project URL)
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Paste your anon public key)

## 3. Deployment (Vercel)
1.  Connect your GitHub repository to Vercel.
2.  Vercel will detect **Next.js** automatically.
3.  Ensure the **Build Command** is `npm run build` (this is the default).
4.  Click **Deploy**.

## 4. Post-Deployment Verification
-   **Authentication**: Visit your site root (`/`). You should see the premium Login page.
-   **Private Routes**: Try visiting `/home` while logged out; you should be redirected back to the root login.

---
### 🛠️ Production Configurations
-   **`vercel.json`**: Included in root with optimized security headers.
-   **Middleware**: Optimized for high-traffic session refreshes.
-   **Performance**: The app uses `force-dynamic` only where necessary.
