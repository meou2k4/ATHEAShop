# ATHEA FashionShop

Hệ thống cửa hàng thời trang cao cấp ATHEA - Được xây dựng với Node.js Backend và React Frontend.

## 🚀 Công nghệ sử dụng

### Backend (FashionShop.NodeApi)
- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **ORM:** Prisma v6
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudinary (Lưu trữ ảnh sản phẩm)
- **Auth:** JWT (JSON Web Token)

### Frontend (FashionShop.Web)
- **Framework:** React 19 + Vite
- **Router:** React Router 7
- **Styling:** Vanilla CSS (Custom UI theo phong cách SIXDO)

---

## 🛠️ Hướng dẫn cài đặt Local

### 1. Yêu cầu hệ thống
- Node.js (v18 trở lên)
- Tài khoản Supabase và Cloudinary

### 2. Cài đặt Backend
```bash
cd FashionShop.NodeApi
npm install
```
Tạo file `.env` trong thư mục `FashionShop.NodeApi` với nội dung:
```env
PORT=7299
DATABASE_URL="your_supabase_connection_string"
JWT_SECRET="your_secret_key"
CLOUDINARY_CLOUD_NAME="your_name"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
EMAIL_USER="your_email"
EMAIL_PASS="your_app_password"
```
Đẩy schema lên database:
```bash
npx prisma db push
```

### 3. Cài đặt Frontend
```bash
cd FashionShop.Web
npm install
```

### 4. Chạy ứng dụng
Sử dụng file script có sẵn ở thư mục gốc:
```bash
./run-all.bat
```
Hoặc chạy tay từng folder bằng lệnh `npm run dev`.

---

## 🌐 Triển khai lên Vercel

Dự án đã được cấu hình sẵn để deploy lên Vercel:

1. **Backend:** Project folder là `FashionShop.NodeApi`. Vercel sẽ tự động nhận diện file `vercel.json`.
2. **Frontend:** Project folder là `FashionShop.Web`. Đã có cấu hình SPA fallback.

**Lưu ý:** Nhớ copy toàn bộ biến môi trường từ `.env` vào phần **Settings > Environment Variables** trên Dashboard của Vercel.

---

## 📜 Tính năng chính
- Quản lý sản phẩm, màu sắc, kích thước (chuẩn quốc tế).
- Quản lý kho ảnh tập trung trên Cloudinary.
- Trang chủ hiển thị hàng Mới (New Arrival) và Giảm giá (Sale Off).
- Tương thích Mobile/Responsive.

---
© 2026 ATHEA Fashion.