# 👗 ATHEA SHOP - Thời trang nữ cao cấp

Dự án Website thương mại điện tử chuyên cung cấp các dòng sản phẩm thời trang thiết kế dành cho phụ nữ hiện đại. Được xây dựng với trải nghiệm người dùng tối ưu trên cả Desktop và Mobile.

---

## ✨ Tính năng nổi bật

### 🎨 Giao diện (UI/UX)
- **Thiết kế Premium**: Giao diện tối giản, sang trọng theo phong cách hiện đại.
- **Hoàn toàn Đáp ứng (Responsive)**: Tối ưu hóa hiển thị trên mọi thiết bị (Desktop, Mobile, Portrait, Landscape).
- **Trải nghiệm mượt mà**: Hiệu ứng chuyển cảnh (transitions) và kính mờ (glassmorphism) tinh tế.

### 🛍️ Trang cửa hàng (Public Side)
- **Header & Footer thông minh**: Cố định (Fixed header) khi cuộn trang, chân trang thông tin tề chỉnh.
- **Lưới sản phẩm linh hoạt**: Tự động điều chỉnh 4/2/1 cột tùy kích thước màn hình.
- **Bộ lọc mạnh mẽ**: Tìm kiếm và lọc sản phẩm theo danh mục, giá cả.
- **Trang chi tiết sản phẩm**: Gallery ảnh vuốt chạm, thông tin SKU/Size trực quan.

### ⚙️ Quản trị (Admin Dashboard)
- **Dashboard chuyên nghiệp**: Quản lý sản phẩm, danh mục và đơn hàng dễ dàng.
- **Đại tu Modal chỉnh sửa**: Quản lý ảnh vCard và SKU với hệ thống lưới (Grid) thông minh.
- **Tối ưu hóa Mobile**: Thanh sidebar drawer tiện lợi cho việc quản lý trên điện thoại.

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: React.js (v18+)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom Token System)
- **State Management**: Context API
- **API Client**: Axios
- **Routing**: React Router DOM

---

## 🚀 Hướng dẫn cài đặt

1. **Clone dự án**:
   ```bash
   git clone https://github.com/meou2k4/ATHEAShop.git
   ```

2. **Cài đặt dependencies**:
   ```bash
   cd ATHEAShop/FashionShop.Web
   npm install
   ```

3. **Chạy môi trường phát triển (Dev Mode)**:
   ```bash
   npm run dev
   ```

4. **Build sản phẩm**:
   ```bash
   npm run build
   ```

---

## 📁 Cấu trúc thư mục (Public Source)

```text
src/
├── api/             # Cấu hình Axios & API calls
├── components/      # Các component dùng chung (Header, Footer,...)
├── context/         # AuthContext & State management
├── pages/           # Các trang Public & Admin
│   ├── admin/       # Dashboard quản trị
│   └── public/      # Trang cửa hàng công khai
├── utils/           # Helper functions
└── index.css        # Hệ thống CSS toàn cục của dự án
```

---

© 2026 **Athea.vn**. All rights reserved.
