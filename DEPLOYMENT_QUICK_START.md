# ⚡ QUICK DEPLOYMENT GUIDE

Deploy your Smart Warehouse app to the cloud in 10 minutes!

---

## 🎯 Overview

- **Backend**: Deploy to Railway (Python/FastAPI)
- **Frontend**: Deploy to Vercel (React/Vite)
- **Database**: SQLite (included with Railway)
- **Total Cost**: FREE (within free tiers)

---

## 📝 Checklist

Before you start:

- [ ] Code pushed to GitHub
- [ ] OpenAI API key ready
- [ ] Railway account created
- [ ] Vercel account created

---

## 🚀 Part 1: Deploy Backend (5 minutes)

### 1. Push to GitHub (if not done)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repo: `iamvuduy/smart_warehouse`
4. Wait for auto-detection and deployment

### 3. Add Environment Variable

In Railway dashboard:

- Click "Variables" tab
- Add: `OPENAI_API_KEY` = `sk-proj-your-key`
- App will auto-redeploy

### 4. Get Backend URL

- Click "Settings" → "Networking"
- Copy the public URL (e.g., `https://smart-warehouse.railway.app`)

### ✅ Backend deployed!

Test: Visit `https://your-app.railway.app/docs`

---

## 🎨 Part 2: Deploy Frontend (5 minutes)

### 1. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend` ⚠️
   - **Framework**: Vite
   - Keep other defaults

### 2. Add Environment Variable

Before deploying, add:

- Key: `VITE_API_BASE_URL`
- Value: `https://your-backend-name.railway.app/api`

### 3. Deploy

Click "Deploy" button and wait (~2 minutes)

### 4. Get Frontend URL

Copy your Vercel URL (e.g., `https://smart-warehouse.vercel.app`)

### ✅ Frontend deployed!

---

## 🎉 Done!

Your app is now live:

- **Frontend**: `https://smart-warehouse.vercel.app`
- **Backend**: `https://smart-warehouse.railway.app`
- **API Docs**: `https://smart-warehouse.railway.app/docs`

---

## 🔄 Future Updates

To deploy updates:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Both Railway and Vercel will auto-deploy!

---

## ❓ Troubleshooting

**Backend not working?**
→ Check OPENAI_API_KEY is set in Railway

**Frontend can't connect to backend?**
→ Check VITE_API_BASE_URL in Vercel settings

**Still having issues?**
→ Read detailed guides:

- `RAILWAY_DEPLOYMENT.md` - Backend deployment
- `VERCEL_DEPLOYMENT.md` - Frontend deployment

---

## 📞 Resources

- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

---

**Happy Deploying! 🚀**
