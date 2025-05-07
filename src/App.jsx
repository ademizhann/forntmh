import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import HealthTips from "./pages/HealthTips.jsx";
import CheckAI from "./pages/CheckAI.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import Footer from "./components/Footer.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import Cart from "./pages/CartPage.jsx";
import MyTestsPage from "./pages/MyTestsPage.jsx";
import ClinicTests from "./pages/ClinicsPage.jsx";
import ClinicDetailPage from "./components/ClinicDetailPage.jsx";
import AuthModal from "./components/LoginModal";
import api from "./api/axios";
import "./App.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const showFooter =
    location.pathname !== "/checkai" &&
    !location.pathname.includes("password-reset-confirm");

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const location = useLocation();

  const fetchCartCount = async () => {
    if (!isAuthenticated) {
      setCartItemCount(0);
      return;
    }

    try {
      const res = await api.get("/cart/");
      setCartItemCount(res.data?.items?.length || 0);
    } catch (err) {
      console.error("Failed to load cart count", err);
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(!!token && authStatus);

    const isPasswordResetUrl = /\/password-reset-confirm\/[^/]+\/[^/]+/.test(
      location.pathname
    );
    if (isPasswordResetUrl) {
      setShowAuthModal(true);
    }
  }, [location]);

  useEffect(() => {
    fetchCartCount();

    if (isAuthenticated) {
      const interval = setInterval(fetchCartCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
    setShowAuthModal(false);
    fetchCartCount();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    setCartItemCount(0);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    if (/\/password-reset-confirm\/[^/]+\/[^/]+/.test(location.pathname)) {
      window.history.pushState({}, "", "/");
    }
  };

  return (
    <>
      <Header
        isAuthenticated={isAuthenticated}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        cartItemCount={isAuthenticated ? cartItemCount : 0}
        authModalOpen={showAuthModal}
        setAuthModalOpen={setShowAuthModal}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/health-tips" element={<HealthTips />} />
          <Route path="/checkai" element={<CheckAI />} />
          <Route path="/clinics" element={<ClinicTests />} />
          <Route path="/clinics/:id" element={<ClinicDetailPage />} />

      
          <Route
            path="/catalog-of-tests"
            element={
              <CatalogPage
                isAuthenticated={isAuthenticated}
                setAuthModalOpen={setShowAuthModal}
              />
            }
          />
          <Route
            path="/cart"
            element={
              isAuthenticated ? (
                <Cart onCartUpdate={fetchCartCount} />
              ) : (
                <Navigate to="/" state={{ from: "cart" }} replace />
              )
            }
          />
          <Route path="/my-tests" element={<MyTestsPage />} />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <ProfilePage />
              ) : (
                <Navigate to="/" state={{ from: "profile" }} replace />
              )
            }
          />
          <Route
            path="/password-reset-confirm/:uidb64/:token"
            element={<HomePage />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>

      <AuthModal
        open={showAuthModal}
        onClose={handleCloseAuthModal}
        onLogin={handleLogin}
      />
    </>
  );
}

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;