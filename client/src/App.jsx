import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider, useApp } from "./context/AppContext";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Men from "./pages/Men";
import Ladies from "./pages/Ladies";
import Unisex from "./pages/Unisex";
import Blog from "./pages/Blog";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import ShippingReturns from "./pages/ShippingReturns";
import AdminDashboard from "./pages/admin/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/shop",
    element: (
      <Layout>
        <Shop />
      </Layout>
    ),
  },
  {
    path: "/men",
    element: (
      <Layout>
        <Men />
      </Layout>
    ),
  },
  {
    path: "/ladies",
    element: (
      <Layout>
        <Ladies />
      </Layout>
    ),
  },
  {
    path: "/blog/:slug",
    element: (
      <Layout>
        <Blog />
      </Layout>
    ),
  },
  {
    path: "/blog",
    element: (
      <Layout>
        <Blog />
      </Layout>
    ),
  },
  {
    path: "/unisex",
    element: (
      <Layout>
        <Unisex />
      </Layout>
    ),
  },
  {
    path: "/shop/:categorySlug",
    element: (
      <Layout>
        <Shop />
      </Layout>
    ),
  },
  {
    path: "/product/:slugOrId",
    element: (
      <Layout>
        <ProductDetails />
      </Layout>
    ),
  },
  {
    path: "/cart",
    element: (
      <Layout>
        <Cart />
      </Layout>
    ),
  },
  {
    path: "/checkout",
    element: (
      <Layout>
        <Checkout />
      </Layout>
    ),
  },
  {
    path: "/order-confirmation/:orderId",
    element: (
      <Layout>
        <OrderConfirmation />
      </Layout>
    ),
  },
  {
    path: "/wishlist",
    element: (
      <Layout>
        <Wishlist />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/register",
    element: (
      <Layout>
        <Register />
      </Layout>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Layout>
        <ForgotPassword />
      </Layout>
    ),
  },
  // The reset link from the recovery email lands here with the token.
  {
    path: "/reset-password/:token",
    element: (
      <Layout>
        <ResetPassword />
      </Layout>
    ),
  },
  {
    path: "/account",
    element: (
      <Layout>
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      </Layout>
    ),
  },
  // Direct tab links (e.g. "/account/orders" from the navbar and the
  // order confirmation page). The Account page resolves the tab from
  // this path segment; the route must exist or React Router falls
  // through to the 404 page.
  {
    path: "/account/:tab",
    element: (
      <Layout>
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout>
        <About />
      </Layout>
    ),
  },
  {
    path: "/contact",
    element: (
      <Layout>
        <Contact />
      </Layout>
    ),
  },
  {
    path: "/faq",
    element: (
      <Layout>
        <FAQ />
      </Layout>
    ),
  },
  {
    path: "/privacy-policy",
    element: (
      <Layout>
        <PrivacyPolicy />
      </Layout>
    ),
  },
  {
    path: "/terms",
    element: (
      <Layout>
        <Terms />
      </Layout>
    ),
  },
  {
    path: "/shipping-returns",
    element: (
      <Layout>
        <ShippingReturns />
      </Layout>
    ),
  },
  {
    path: "/admin",
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "*",
    element: (
      <Layout>
        <div className="max-w-[1440px] mx-auto px-4 py-24 text-center">
          <p className="eyebrow mb-3">Error 404</p>
          <h1 className="section-heading text-3xl md:text-4xl mb-6">
            Page Not Found
          </h1>
          <p className="text-onyx/60 text-sm mb-8">
            The page you are looking for does not exist.
          </p>
          <a href="/" className="btn-gold inline-block">
            Return Home
          </a>
        </div>
      </Layout>
    ),
  },
]);

export default function App() {
  return (
    <AppProvider>
      <Toaster
        position="top-right"
        containerStyle={{
          top: 72,
          right: 12,
        }}
        toastOptions={{
          duration: 3200,
          style: {
            background: "#0d0d0d",
            color: "#f8f4ef",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            borderLeft: "2px solid #D4AF37",
            borderRadius: 0,
            boxShadow: "0 24px 48px -16px rgba(0,0,0,0.5)",
            padding: "16px 22px",
            maxWidth: 340,
          },
          success: {
            iconTheme: {
              primary: "#D4AF37",
              secondary: "#0d0d0d",
            },
          },
          error: {
            iconTheme: {
              primary: "#b03a3a",
              secondary: "#0d0d0d",
            },
          },
        }}
        visibleToasts={3}
      />
      <RouterProvider router={router} />
    </AppProvider>
  );
}
