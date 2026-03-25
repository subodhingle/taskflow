# TaskFlow — Task Management Dashboard

Production-ready full-stack SaaS dashboard with Employee and HR/Admin roles.

## Stack
- Frontend: React 19 + Vite + Tailwind CSS + Recharts + Socket.io-client
- Backend: Node.js + Express + MongoDB + JWT + Socket.io

---

## Run Locally

### Requirements
- Node.js >= 18
- MongoDB running on localhost:27017

```bash
# 1. Install all dependencies
npm run install:all

# 2. Seed the database (first time only)
npm run seed

# 3. Start backend  (terminal 1)
npm run dev:backend

# 4. Start frontend (terminal 2)
npm run dev:frontend
```

Open http://localhost:3000

### Demo Logins
| Role     | Email              | Password    |
|----------|--------------------|-------------|
| HR Admin | hr@company.com     | password123 |
| Employee | alex@company.com   | password123 |
| Employee | maria@company.com  | password123 |
| Employee | james@company.com  | password123 |

---

## Deploy to Render + Vercel (Recommended)

### Step 1 — MongoDB Atlas
1. Go to https://cloud.mongodb.com → create free cluster
2. Database Access → add user with password
3. Network Access → allow `0.0.0.0/0`
4. Connect → copy the connection string

### Step 2 — Deploy Backend to Render
1. Push this repo to GitHub
2. New Web Service → connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskdashboard
   JWT_SECRET=<random 32+ char string>
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   PORT=5000
   ```
7. Deploy → copy the service URL (e.g. `https://taskflow-api.onrender.com`)

### Step 3 — Deploy Frontend to Vercel
1. New Project → import repo
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://taskflow-api.onrender.com/api
   VITE_SOCKET_URL=https://taskflow-api.onrender.com
   ```
6. Deploy

### Step 4 — Seed production database
```bash
cd backend
# Temporarily set MONGO_URI to your Atlas URI in .env
node seed.js
```

---

## Single-Server Deploy (Backend serves Frontend)

```bash
# Build frontend
cd frontend && npm run build

# Set in backend/.env:
# NODE_ENV=production
# CLIENT_URL=https://your-domain.com

# Start backend (serves /dist automatically)
cd backend && npm start
```

---

## Environment Variables Reference

### backend/.env
| Variable    | Description                        | Example                          |
|-------------|------------------------------------|----------------------------------|
| PORT        | Server port                        | 5000                             |
| MONGO_URI   | MongoDB connection string          | mongodb+srv://...                |
| JWT_SECRET  | JWT signing secret (32+ chars)     | my_super_secret_key_here         |
| NODE_ENV    | Environment                        | production                       |
| CLIENT_URL  | Frontend URL (CORS)                | https://your-app.vercel.app      |

### frontend/.env.production
| Variable        | Description              | Example                                    |
|-----------------|--------------------------|--------------------------------------------|
| VITE_API_URL    | Backend API base URL     | https://taskflow-api.onrender.com/api      |
| VITE_SOCKET_URL | Backend socket URL       | https://taskflow-api.onrender.com          |
