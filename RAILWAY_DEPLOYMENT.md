# 🚂 Deploy Smart Warehouse to Railway

## 📋 Prerequisites

1. **Railway Account** - Sign up at https://railway.app
2. **GitHub Account** - Your code should be on GitHub
3. **OpenAI API Key** - Get from https://platform.openai.com/api-keys

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository: **`iamvuduy/smart_warehouse`**

### Step 3: Configure Environment Variables

In Railway dashboard:

1. Click on your project
2. Go to **"Variables"** tab
3. Add the following variable:
   ```
   Key: OPENAI_API_KEY
   Value: sk-proj-your-actual-api-key-here
   ```
4. Click **"Add"**

### Step 4: Configure Build Settings (Optional)

Railway should auto-detect the configuration, but if needed:

1. Go to **"Settings"** tab
2. Under **"Build"**:
   - Build Command: (leave default or empty)
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Under **"Deploy"**:
   - Check **"Watch Paths"**: `backend/**`, `requirements.txt`

### Step 5: Deploy

1. Railway will automatically deploy your app
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.railway.app`

### Step 6: Test Your Backend

Visit these URLs (replace with your Railway URL):

- **API Health**: `https://your-app.railway.app/`
- **API Docs**: `https://your-app.railway.app/docs`
- **SKU List**: `https://your-app.railway.app/api/sku/list`

---

## 🌐 Deploy Frontend (Vercel - Recommended)

### Step 1: Prepare Frontend

Update the API base URL in your frontend to point to Railway backend.

Edit `frontend/src/AppNew.jsx`:

```javascript
const API_BASE = "https://your-app.railway.app/api";
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**

### Step 3: Update CORS (if needed)

Add your Vercel URL to backend CORS origins in `backend/main.py`:

```python
origins = [
    "http://localhost:5173",
    "https://your-frontend.vercel.app",
]
```

Then redeploy backend on Railway.

---

## 🔧 Troubleshooting

### Build Fails

**Error**: `ModuleNotFoundError`

- **Fix**: Make sure `requirements.txt` is in the root directory
- Check Railway logs for specific missing modules

**Error**: `Database error`

- **Fix**: Railway uses ephemeral storage. Database will be recreated on each deploy.
- Consider using Railway PostgreSQL for persistent storage

### Runtime Errors

**Error**: `OPENAI_API_KEY not found`

- **Fix**: Make sure you added the environment variable in Railway dashboard
- Redeploy after adding the variable

**Error**: `Port binding error`

- **Fix**: Make sure your start command uses `--port $PORT`
- Railway automatically assigns a port via `$PORT` variable

### CORS Errors

**Error**: `CORS policy blocked`

- **Fix**: Update `allow_origins` in `backend/main.py`
- Redeploy backend

---

## 📊 Monitoring

In Railway dashboard:

- **Logs**: View real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: See deployment history

---

## 💰 Pricing

Railway offers:

- **Free Tier**: $5 credit/month (good for testing)
- **Hobby Plan**: $5/month per service
- **Pro Plan**: Pay as you go

Your app should fit in the free tier for development/testing.

---

## 🔄 Automatic Deployments

Railway automatically redeploys when you push to your GitHub repository:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will detect the push and redeploy automatically!

---

## 📝 Files Required for Railway

- ✅ `requirements.txt` - Python dependencies
- ✅ `runtime.txt` - Python version
- ✅ `Procfile` - Start command (optional, backup)
- ✅ `nixpacks.toml` - Build configuration
- ✅ `railway.json` - Railway-specific config
- ✅ `railway.toml` - Railway deployment config

---

## 🎉 Success!

Your Smart Warehouse app should now be live!

- **Backend**: `https://your-app.railway.app`
- **API Docs**: `https://your-app.railway.app/docs`
- **Frontend**: `https://your-frontend.vercel.app`

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Vercel Docs: https://vercel.com/docs

---

## 🔐 Security Notes

⚠️ **Important**:

- Never commit `.env` file with real API keys
- Always use environment variables in Railway
- Rotate API keys regularly
- Monitor usage in OpenAI dashboard
