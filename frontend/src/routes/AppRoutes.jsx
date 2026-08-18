import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Home } from '../pages/Home/Home';
import { Shop } from '../pages/Shop/Shop';
import { ProductDetail } from '../pages/Product/ProductDetail';
import { Cart } from '../pages/Cart/Cart';
import { Checkout } from '../pages/Checkout/Checkout';
import { Wishlist } from '../pages/Wishlist/Wishlist';
import { Login } from '../pages/Auth/Login';
import { Register } from '../pages/Auth/Register';
import { Account } from '../pages/Account/Account';
import { Orders } from '../pages/Orders/Orders';
import { OrderDetail } from '../pages/Orders/OrderDetail';
import { SearchPage } from '../pages/Search/SearchPage';
import { Heritage } from '../pages/Heritage/Heritage';
import { Contact } from '../pages/Contact/Contact';
import { ProtectedRoute } from './ProtectedRoute';

// Admin CMS Imports
import { ProtectedAdminRoute } from './ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../pages/Admin/Dashboard/Dashboard';
import { Products as AdminProducts } from '../pages/Admin/Products/Products';
import { Categories as AdminCategories } from '../pages/Admin/Categories/Categories';
import { Collections as AdminCollections } from '../pages/Admin/Collections/Collections';
import { Inventory as AdminInventory } from '../pages/Admin/Inventory/Inventory';
import { Orders as AdminOrders } from '../pages/Admin/Orders/Orders';
import { OrderDetail as AdminOrderDetail } from '../pages/Admin/Orders/OrderDetail';
import { Customers as AdminCustomers } from '../pages/Admin/Customers/Customers';
import { Content as AdminContent } from '../pages/Admin/Content/Content';
import { Media as AdminMedia } from '../pages/Admin/Media/Media';
import { Messages as AdminMessages } from '../pages/Admin/Messages/Messages';
import { Settings as AdminSettings } from '../pages/Admin/Settings/Settings';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="heritage" element={<Heritage />} />
        <Route path="contact" element={<Contact />} />

        {/* Protected Customer Routes */}
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Protected Admin CMS Portal Routes */}
      <Route
        path="admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
};
