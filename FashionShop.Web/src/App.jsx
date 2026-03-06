import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import ProductDetailPage from './pages/admin/ProductDetailPage';
import PropertiesPage from './pages/admin/PropertiesPage';
import SettingsPage from './pages/admin/SettingsPage';

// Public pages
import PublicLayout from './pages/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import ProductListPage from './pages/public/ProductListPage';
import PublicProductDetailPage from './pages/public/PublicProductDetailPage';
import ShoppingPolicyPage from './pages/public/ShoppingPolicyPage';
import ContactPage from './pages/public/ContactPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/san-pham" element={<ProductListPage />} />
            <Route path="/san-pham/:slug" element={<PublicProductDetailPage />} />
            <Route path="/chinh-sach" element={<ShoppingPolicyPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
          </Route>

          {/* ===== ADMIN ROUTES ===== */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="products/:id/detail" element={<ProductDetailPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
