# 🎨 Deploy Frontend to Vercel

## 📋 Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Railway Backend URL** - Get from Railway dashboard after deploying backend

---

## 🚀 Step-by-Step Deployment

### Step 1: Update API Base URL

Before deploying frontend, update the API URL to point to your Railway backend.

Edit `frontend/src/AppNew.jsx`:

Find this line:

```javascript
const API_BASE = "http://localhost:8000/api";
```

Replace with your Railway backend URL:

```javascript
const API_BASE = "https://your-backend-name.railway.app/api";
```

**💡 Tip**: Use environment variable instead:

```javascript
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
```

### Step 2: Create Environment Variable File

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-name.railway.app/api
```

Update `AppNew.jsx`:

```javascript
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
```

### Step 3: Commit Changes

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Step 4: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository: `iamvuduy/smart_warehouse`
5. Configure project:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ⚠️ IMPORTANT
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:

   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-name.railway.app/api`

7. Click **"Deploy"**

### Step 5: Wait for Deployment

Vercel will:

- Install dependencies
- Build your app
- Deploy to CDN
- Give you a URL like: `https://smart-warehouse-xyz.vercel.app`

---

## 🔧 Alternative: Manual Configuration

If Vercel doesn't detect settings correctly:

### vercel.json

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

---

## 🔄 Update Backend CORS

After deploying frontend, update backend to allow your Vercel domain.

Edit `backend/main.py`:

```python
origins = [
    "http://localhost:5173",
    "https://smart-warehouse-xyz.vercel.app",  # Your Vercel URL
]
```

Or allow all Vercel domains:

```python
allow_origins=["*"],  # Already configured
```

Commit and push to trigger Railway redeploy:

```bash
git add .
git commit -m "Update CORS for Vercel"
git push origin main
```

---

## ✅ Test Your Deployment

1. Visit your Vercel URL: `https://smart-warehouse-xyz.vercel.app`
2. Try adding a SKU
3. Try optimizing layout
4. Check browser console for errors

---

## 🔍 Troubleshooting

### Build Fails

**Error**: `Cannot find package`

- Check `package.json` is in `frontend/` directory
- Verify Root Directory is set to `frontend` in Vercel

**Error**: `Build command failed`

- Check build logs in Vercel dashboard
- Test build locally: `cd frontend && npm run build`

### API Errors

**Error**: `Network Error` or `Failed to fetch`

- Check API_BASE_URL is correct
- Verify Railway backend is running
- Check CORS configuration

**Error**: `404 Not Found`

- Verify Railway backend URL is correct
- Check API endpoints in `/docs`

### Environment Variables Not Working

- Make sure variable name starts with `VITE_`
- Redeploy after adding variables
- Check build logs to see if variables are loaded

---

## 🎨 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `warehouse.yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

### Add Custom Domain to Railway (Backend)

1. Go to Railway project settings
2. Click "Generate Domain" or add custom domain
3. Update frontend `VITE_API_BASE_URL` with new domain
4. Redeploy frontend on Vercel

---

## 🔄 Automatic Deployments

Both platforms support automatic deployments:

**Vercel**: Auto-deploys on push to `main` branch
**Railway**: Auto-deploys backend on push to `main` branch

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Both frontend and backend will redeploy automatically!
```

---

## 📊 Monitor Deployments

### Vercel Dashboard

- **Deployments**: See all deployments and their status
- **Analytics**: View page views and performance
- **Logs**: Check build and function logs

### Railway Dashboard

- **Deployments**: See backend deployment history
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time backend logs

---

## 💰 Pricing

**Vercel Free Tier**:

- Unlimited deployments
- 100GB bandwidth/month
- Good for personal projects

**Vercel Pro** ($20/month):

- More bandwidth
- Analytics
- Team features

---

## 🎉 Success Checklist

- ✅ Backend deployed on Railway
- ✅ Frontend deployed on Vercel
- ✅ API_BASE_URL configured correctly
- ✅ CORS configured in backend
- ✅ Environment variables set
- ✅ App loads without errors
- ✅ Can add SKUs
- ✅ Can optimize layout

---

## 📝 URLs Summary

After deployment, save these URLs:

```
Backend (Railway):  https://your-backend.railway.app
Backend API Docs:   https://your-backend.railway.app/docs
Frontend (Vercel):  https://your-frontend.vercel.app
```

Share the Vercel URL with users to access your app!

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Railway Docs: https://docs.railway.app
