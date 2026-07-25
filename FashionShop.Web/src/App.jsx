import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
import BannerPage from './pages/admin/BannerPage';
import SettingsPage from './pages/admin/SettingsPage';

// Public pages
import PublicLayout from './pages/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import ProductListPage from './pages/public/ProductListPage';
import PublicProductDetailPage from './pages/public/PublicProductDetailPage';
import ShoppingPolicyPage from './pages/public/ShoppingPolicyPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';

function App() {
  return (
    <HelmetProvider>
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
              <Route path="banner" element={<BannerPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
