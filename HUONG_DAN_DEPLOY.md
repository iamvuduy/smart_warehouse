# 🚀 HƯỚNG DẪN DEPLOY LÊN RAILWAY - TIẾNG VIỆT

## 📦 Các file đã tạo để deploy

### Files cấu hình Railway:

✅ `Procfile` - Lệnh khởi động ứng dụng
✅ `railway.json` - Cấu hình Railway
✅ `railway.toml` - Cấu hình deployment
✅ `nixpacks.toml` - Cấu hình build
✅ `requirements.txt` - Dependencies Python (root level)
✅ `runtime.txt` - Phiên bản Python
✅ `.dockerignore` - Loại trừ file không cần thiết

### Files hướng dẫn:

📖 `DEPLOYMENT_QUICK_START.md` - Hướng dẫn nhanh (10 phút)
📖 `RAILWAY_DEPLOYMENT.md` - Hướng dẫn chi tiết Railway
📖 `VERCEL_DEPLOYMENT.md` - Hướng dẫn chi tiết Vercel

### Code đã cập nhật:

🔧 `backend/main.py` - Thêm health check endpoints
🔧 `frontend/src/AppNew.jsx` - Dùng environment variable cho API URL

---

## 🎯 CÁC BƯỚC DEPLOY (Chi tiết)

### BƯỚC 1: Deploy Backend lên Railway

#### 1.1. Tạo tài khoản Railway

1. Truy cập: https://railway.app
2. Click "Start a New Project"
3. Đăng nhập bằng GitHub

#### 1.2. Kết nối GitHub Repository

1. Chọn "Deploy from GitHub repo"
2. Cấp quyền cho Railway truy cập GitHub
3. Chọn repository: **iamvuduy/smart_warehouse**
4. Railway sẽ tự động detect và bắt đầu build

#### 1.3. Cấu hình Environment Variables

1. Trong Railway dashboard, click vào project vừa tạo
2. Click tab "Variables"
3. Thêm biến môi trường:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxx
   ```
   (Thay bằng API key thật của bạn)
4. Click "Add" → Railway sẽ tự động redeploy

#### 1.4. Lấy URL Backend

1. Click tab "Settings"
2. Scroll xuống "Networking"
3. Click "Generate Domain"
4. Copy URL (ví dụ: `https://smart-warehouse-production.up.railway.app`)
5. **LƯU LẠI URL NÀY** - cần dùng cho frontend

#### 1.5. Kiểm tra Backend hoạt động

Mở các URL sau trong browser:

- Health check: `https://your-app.railway.app/`
- API docs: `https://your-app.railway.app/docs`
- SKU list: `https://your-app.railway.app/api/sku/list`

Nếu thấy JSON response → Backend đã hoạt động! ✅

---

### BƯỚC 2: Deploy Frontend lên Vercel

#### 2.1. Tạo tài khoản Vercel

1. Truy cập: https://vercel.com/signup
2. Đăng nhập bằng GitHub

#### 2.2. Import Project

1. Truy cập: https://vercel.com/new
2. Click "Import Project"
3. Chọn repository: **iamvuduy/smart_warehouse**
4. Click "Import"

#### 2.3. Cấu hình Project Settings

⚠️ **QUAN TRỌNG** - Cấu hình như sau:

```
Framework Preset: Vite
Root Directory: frontend          ← PHẢI SET NÀY!
Build Command: npm run build       (mặc định, để nguyên)
Output Directory: dist             (mặc định, để nguyên)
Install Command: npm install       (mặc định, để nguyên)
```

#### 2.4. Thêm Environment Variable

**TRƯỚC KHI DEPLOY**, thêm biến môi trường:

1. Click "Environment Variables"
2. Thêm:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-name.railway.app/api`
     (Thay bằng Railway URL từ Bước 1.4, thêm `/api` ở cuối)
   - Environment: Production

Ví dụ:

```
VITE_API_BASE_URL=https://smart-warehouse-production.up.railway.app/api
```

#### 2.5. Deploy

1. Click "Deploy"
2. Đợi 2-3 phút cho Vercel build và deploy
3. Sau khi xong, bạn sẽ có URL như:
   `https://smart-warehouse-xyz.vercel.app`

#### 2.6. Kiểm tra Frontend

1. Mở URL Vercel trong browser
2. Thử thêm SKU
3. Thử optimize layout
4. Nếu hoạt động bình thường → Done! ✅

---

## 🔧 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: Railway build failed

**Triệu chứng**: Build bị lỗi, báo "Command failed"

**Nguyên nhân**: Thiếu file `requirements.txt` ở root

**Giải pháp**:

- File đã được tạo rồi, nếu vẫn lỗi, check Railway logs
- Đảm bảo file `requirements.txt` có ở root directory (đã có)

### Lỗi 2: Vercel "Cannot find module"

**Triệu chứng**: Build failed, báo không tìm thấy module

**Nguyên nhân**: Root Directory chưa set đúng

**Giải pháp**:

1. Vào Vercel project settings
2. General → Root Directory
3. Set = `frontend`
4. Redeploy

### Lỗi 3: Frontend không connect được Backend

**Triệu chứng**: Frontend load được nhưng không hiển thị data

**Nguyên nhân**:

- `VITE_API_BASE_URL` chưa set hoặc sai
- CORS chưa được cấu hình

**Giải pháp**:

1. Check Vercel Environment Variables
2. Đảm bảo có `VITE_API_BASE_URL` và đúng URL Railway
3. Redeploy Vercel
4. Backend đã có CORS `allow_origins=["*"]` nên không vấn đề

### Lỗi 4: "OPENAI_API_KEY not found"

**Triệu chứng**: Backend báo lỗi khi optimize

**Nguyên nhân**: Chưa set API key trong Railway

**Giải pháp**:

1. Vào Railway dashboard
2. Tab Variables
3. Add `OPENAI_API_KEY`
4. Tự động redeploy

---

## 📱 KIỂM TRA SAU KHI DEPLOY

### Checklist hoàn thành:

- [ ] Backend Railway hoạt động: `/docs` accessible
- [ ] Frontend Vercel load được
- [ ] Có thể thêm SKU mới
- [ ] Có thể optimize layout (cần OpenAI API key)
- [ ] Tooltip hiển thị khi hover SKU
- [ ] Priority panel cập nhật khi thêm SKU

---

## 🔄 UPDATE CODE SAU KHI DEPLOY

Khi bạn muốn update code:

```bash
# 1. Sửa code như bình thường
# 2. Commit và push
git add .
git commit -m "Update feature XYZ"
git push origin main

# 3. Railway và Vercel sẽ TỰ ĐỘNG deploy!
```

Không cần làm gì thêm, cả 2 platform đều có auto-deploy.

---

## 💰 CHI PHÍ

### Railway (Backend):

- **Free tier**: $5 credit/tháng
- Backend này dùng khoảng $3-4/tháng
- → Đủ dùng free tier

### Vercel (Frontend):

- **Free tier**:
  - Bandwidth: 100GB/tháng
  - Builds: Unlimited
  - Projects: Unlimited
- → Hoàn toàn free cho dự án này

**Tổng chi phí: $0** (trong free tier)

---

## 📊 MONITORING

### Railway Dashboard:

- **Logs**: Xem log backend real-time
- **Metrics**: CPU, RAM, Network usage
- **Deployments**: Lịch sử deploy

### Vercel Dashboard:

- **Deployments**: Lịch sử deploy frontend
- **Analytics**: Số lượng visitors (Pro plan)
- **Logs**: Build logs và function logs

---

## 🎉 HOÀN TẤT!

Sau khi làm xong 2 bước trên, bạn có:

✅ Backend API chạy trên Railway
✅ Frontend web app chạy trên Vercel
✅ Auto-deploy khi push code
✅ Free hosting (trong free tier)
✅ SSL/HTTPS tự động
✅ Global CDN cho frontend

**URLs của bạn:**

- Backend: `https://[your-app].railway.app`
- API Docs: `https://[your-app].railway.app/docs`
- Frontend: `https://[your-project].vercel.app`

Chia sẻ URL Vercel cho người khác để họ dùng app của bạn! 🚀

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. **Đọc file hướng dẫn chi tiết**:

   - `DEPLOYMENT_QUICK_START.md` - Hướng dẫn nhanh
   - `RAILWAY_DEPLOYMENT.md` - Chi tiết Railway
   - `VERCEL_DEPLOYMENT.md` - Chi tiết Vercel

2. **Check logs**:

   - Railway: Dashboard → Logs
   - Vercel: Dashboard → Deployments → View logs

3. **Resources**:
   - Railway Docs: https://docs.railway.app
   - Vercel Docs: https://vercel.com/docs
   - Railway Discord: https://discord.gg/railway

---

**Chúc bạn deploy thành công! 🎊**
