# Deployment Guide

This project is configured for deployment on **Render (Backend)** and **Vercel (Frontend)**. Follow these steps strictly to ensure a production-ready setup.

---

## 1. Environment Variables

### A) Backend (Render)
These variables must be set in your Render Web Service settings.

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `PORT` | Auto-set by Render, but good to have explicit. | `10000` |
| `SUPABASE_URL` | Your Supabase Project URL. | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key. | `eyFa...` |
| `FRONTEND_ORIGIN` | The URL of your deployed Vercel frontend (no trailing slash). | `https://qr-ordering.vercel.app` |

### B) Frontend (Vercel)
These variables must be set in your Vercel Project settings.

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_API_BASE_URL` | The URL of your deployed Render backend (with `/api` suffix). | `https://backend.onrender.com/api` |

---

## 2. Deploying Backend (Render)

1.  **Push Code**: Ensure your latest code is pushed to GitHub.
2.  **Create Service**:
    *   Log in to [Render Dashboard](https://dashboard.render.com).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
3.  **Configure Settings**:
    *   **Runtime**: `Node`
    *   **Root Directory**: `apps/backend` (Critical step!)
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: `Free` (for testing)
4.  **Add Environment Variables**:
    *   Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
    *   For `FRONTEND_ORIGIN`, initially you can use `*` if you haven't deployed Vercel yet, but **UPDATE IT** once Vercel gives you a URL.
5.  **Deploy**: Click "Create Web Service".
    *   Wait for the "Backend is running 🚀" log.
    *   **Copy the service URL** (e.g., `https://my-backend.onrender.com`).

---

## 3. Deploying Frontend (Vercel)

1.  **Push Code**: Ensure your latest code is pushed to GitHub.
2.  **Create Project**:
    *   Log in to [Vercel Dashboard](https://vercel.com).
    *   Click **Add New...** -> **Project**.
    *   Import your GitHub repository.
3.  **Configure Settings**:
    *   **Framework Preset**: Next.js (Auto-detected).
    *   **Root Directory**: Click "Edit" and select `apps/frontend`.
4.  **Add Environment Variables**:
    *   Add `NEXT_PUBLIC_API_BASE_URL` with your Render Backend URL + `/api` (e.g., `https://my-backend.onrender.com/api`).
    *   *Note: Do NOT include a trailing slash.*
5.  **Deploy**: Click "Deploy".
6.  **Update Backend CORS**:
    *   Once Vercel deploys, copy the domain (e.g., `https://qr-cafe-app.vercel.app`).
    *   Go back to Render -> Environment Variables.
    *   Update `FRONTEND_ORIGIN` to this Vercel URL.
    *   Render will auto-redeploy.

---

## 4. Post-Deployment Verification Checklist

- [ ] **Backend Health**: Visit `https://YOUR_RENDER_URL/` -> Should see "Backend is running 🚀".
- [ ] **Frontend Load**: Visit Vercel URL -> Should see Landing Page or Menu.
- [ ] **Menu Fetch**: Go to `/menu?table=1`. Verify menu items load (images should load from Supabase).
- [ ] **Session Creation**: Check Network tab for `POST /sessions/start` - should return 200 OK.
- [ ] **Placing Order**: Add items and place order.
- [ ] **CORS Check**: Ensure no "CORS Header Missing" errors in console.
- [ ] **Persistence**: Refresh the page. Session should persist.
