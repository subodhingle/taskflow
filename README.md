# TaskFlow — Task Management Dashboard

Production-ready full-stack SaaS dashboard with Employee and HR/Admin roles.

## Stack
- Frontend: React 19 + Vite + Tailwind CSS + Recharts + Three.js + Socket.io-client
- Backend: Node.js + Express + MongoDB + JWT + Socket.io

---

## Run Locally

```bash
# Install all dependencies
npm run install:all

# Seed the database (first time only)
npm run seed

# Terminal 1 — backend
npm run dev:backend     # http://localhost:5000

# Terminal 2 — frontend
npm run dev:frontend    # http://localhost:3000
```

### Demo Logins
| Role     | Email              | Password    |
|----------|--------------------|-------------|
| HR Admin | hr@company.com     | password123 |
| Employee | alex@company.com   | password123 |

---

## Deploy — Full Stack

### STEP 1 — MongoDB Atlas (Database)
1. Go to https://cloud.mongodb.com → create free M0 cluster
2. Database Access → Add user → username + password
3. Network Access → Add IP → `0.0.0.0/0` (allow all)
4. Connect → Drivers → copy connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskdashboard?retryWrites=true&w=majority
   ```

---

### STEP 2 — Backend on Render (Free)
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo: `subodhingle/taskflow`
3. Configure:
   - **Name:** `taskflow-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   NODE_ENV    = production
   PORT        = 5000
   MONGO_URI   = mongodb+srv://user:pass@cluster.mongodb.net/taskdashboard?retryWrites=true&w=majority
   JWT_SECRET  = any_random_32+_char_string_here
   CLIENT_URL  = https://taskflow-xyz.vercel.app   ← your Vercel URL (add after step 3)
   ```
5. Click **Create Web Service** → wait for deploy
6. Copy your Render URL: `https://taskflow-backend.onrender.com`

> After deploy, seed the DB once:
> Open Render dashboard → your service → Shell tab → run: `node seed.js`

---

### STEP 3 — Frontend on Vercel (Free)
1. Go to https://vercel.com → New Project → Import `subodhingle/taskflow`
2. **Leave Root Directory as `/`** — `vercel.json` handles everything
3. Add Environment Variables:
   ```
   VITE_API_URL    = https://taskflow-backend.onrender.com/api
   VITE_SOCKET_URL = https://taskflow-backend.onrender.com
   ```
4. Click **Deploy**
5. Copy your Vercel URL: `https://taskflow-xyz.vercel.app`

---

### STEP 4 — Connect Frontend ↔ Backend
1. Go back to **Render** → your backend service → Environment
2. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL = https://taskflow-xyz.vercel.app
   ```
3. Render will auto-redeploy

---

## Environment Variables Reference

### backend/.env (local) / Render (production)
| Variable   | Example                                              |
|------------|------------------------------------------------------|
| PORT       | 5000                                                 |
| MONGO_URI  | mongodb+srv://user:pass@cluster.mongodb.net/taskdb   |
| JWT_SECRET | taskflow_super_secret_min_32_chars                   |
| NODE_ENV   | production                                           |
| CLIENT_URL | https://taskflow-xyz.vercel.app                      |

### frontend env (Vercel dashboard)
| Variable        | Example                                          |
|-----------------|--------------------------------------------------|
| VITE_API_URL    | https://taskflow-backend.onrender.com/api        |
| VITE_SOCKET_URL | https://taskflow-backend.onrender.com            |
