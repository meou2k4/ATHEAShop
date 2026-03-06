# ATHEA FashionShop - Node.js API

Backend RESTful API cho website thời trang ATHEA, viết bằng **Node.js + Express + Prisma + PostgreSQL**.

## 🚀 Bắt đầu nhanh

### 1. Cài dependencies
```bash
npm install
```

### 2. Thiết lập biến môi trường
```bash
cp .env.example .env
# Mở file .env và điền đầy đủ các giá trị
```

### 3. Kết nối Database & tạo bảng
```bash
npm run db:push
```

### 4. Chạy server development
```bash
npm run dev
```
Server chạy tại: `http://localhost:7299`

---

## 📦 Cấu trúc thư mục
```
src/
├── config/          # Cấu hình DB (Prisma), Cloudinary
├── controllers/     # Logic nghiệp vụ từng module
├── middleware/       # Xác thực JWT
├── routes/          # Định nghĩa các API routes
└── utils/           # Tiện ích (slugify...)
prisma/
└── schema.prisma    # Schema Database
```

## 🔑 Các biến môi trường cần thiết (.env)
| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | URL kết nối PostgreSQL (Supabase) |
| `JWT_SECRET` | Khoá bí mật để ký JWT |
| `CLOUDINARY_CLOUD_NAME` | Tên Cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API Key Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret Cloudinary |
| `EMAIL_USER` | Email Gmail dùng gửi thông báo |
| `EMAIL_PASS` | App Password Gmail |

## 📋 Danh sách API
Xem thêm chi tiết trong tài liệu `nodejs_migration_docs.md`.
