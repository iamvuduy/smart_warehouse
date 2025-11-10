# Thiết lập OPENAI_API_KEY

## Các bước thiết lập:

### 1. Lấy API Key từ OpenAI

- Truy cập: https://platform.openai.com/api-keys
- Đăng nhập vào tài khoản OpenAI của bạn
- Nhấn "Create new secret key"
- Copy API key (bắt đầu với `sk-...`)

### 2. Cập nhật file .env

Mở file `backend/.env` và thay thế:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Thành:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

(Dán API key thực của bạn)

### 3. Khởi động lại Backend

Sau khi cập nhật `.env`, khởi động lại server:

```bash
cd backend
source .venv/Scripts/activate  # Windows Git Bash
uvicorn backend.main:app --reload
```

## Lưu ý:

- ⚠️ **KHÔNG** commit file `.env` vào git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ sử dụng file `.env.example` làm template
- Giữ API key của bạn bảo mật

## Kiểm tra:

Sau khi thiết lập, thử sử dụng tính năng "AI Optimization Insight" trong ứng dụng.
