# Render Setup Instructions

## Kiểm tra và thêm OPENAI_API_KEY

1. Đăng nhập vào https://dashboard.render.com
2. Chọn service backend của bạn
3. Click tab **"Environment"** ở menu bên trái
4. Kiểm tra xem có biến `OPENAI_API_KEY` chưa

### Nếu chưa có, thêm biến môi trường:

- Click **"Add Environment Variable"**
- Key: `OPENAI_API_KEY`
- Value: `sk-proj-...` (API key từ OpenAI - bắt đầu bằng sk-proj- hoặc sk-)
- Click **"Save Changes"**

### Kiểm tra API key có đúng:

1. API key phải bắt đầu bằng `sk-proj-` hoặc `sk-`
2. Độ dài khoảng 50-60 ký tự
3. Lấy từ https://platform.openai.com/api-keys

## Clear Build Cache và Redeploy

Sau khi thêm API key:

1. Scroll xuống **"Manual Deploy"** section
2. Click **"Clear build cache & deploy"**
3. Đợi deploy hoàn tất (~2-3 phút)
4. Kiểm tra logs có dòng: `OPENAI_API_KEY loaded: Yes`

## Kiểm tra Logs

Trong tab **"Logs"**, bạn sẽ thấy:

- `Loading .env from: ...`
- `OPENAI_API_KEY loaded: Yes` (nếu đã set đúng)
- `[DEBUG] Calling OpenAI API` (khi gọi AI)
- `[OPTIMIZE] Instructions: ...` (khi optimize)

Nếu thấy `OPENAI_API_KEY loaded: No` → Chưa set API key!
