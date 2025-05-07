import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  Modal,
  Box,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  MenuItem
} from "@mui/material";
import { FaGlobe, FaMapMarkerAlt, FaSearch, FaBars } from "react-icons/fa";
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoginModal from "./LoginModal";
import api from "../api/axios";

const Header = ({ isAuthenticated, onLogin, onLogout, cartItemCount = 0, authModalOpen, setAuthModalOpen }) => {
  const [language, setLanguage] = useState("ENG");
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [city, setCity] = useState(localStorage.getItem("selectedCity") || "Almaty");
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  const location = useLocation();
  const navigate = useNavigate();

  // Поиск
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ analyses: [], hospitals: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSearch = async (q) => {
    if (!q.trim()) {
      setSearchResults({ analyses: [], hospitals: [] });
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await api.get("/analysis/search/", {
        params: { q }
      });
      setSearchResults(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Search error:", err.response?.data || err.message);
    }
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchSearch(q);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
    }
  };

  const handleSuccessfulLogin = (token) => {
    onLogin(token);
    setAuthModalOpen(false);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "CheckAI", path: "/checkai" },
    { label: "Catalog of Tests", path: "/catalog-of-tests" },
    { label: "Clinics & Laboratories", path: "/clinics" },
    { label: "Health Tips", path: "/health-tips" },
    { label: "Help & Support", path: "/help-support" },
    { label: "Cart", path: "/cart" }
  ];

  const handleNavClick = (item) => {
    if (item.path === "/help-support") {
      if (location.pathname !== "/") navigate("/");
      setTimeout(() => {
        const el = document.getElementById("help-support");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      navigate(item.path);
    }
    setDrawerOpen(false);
  };

  const handleAvatarClick = () => navigate("/profile");
  const handleCartClick = () => navigate("/cart");

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#001A00", p: isMobile ? 0 : 1, top: 0, width: "100%", zIndex: 1000 }}>
        <Toolbar sx={{
          minHeight: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "8px 0" : "inherit"
        }}>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <FaBars />
            </IconButton>
          )}

          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: isMobile ? 1 : 0,
            textAlign: isMobile ? "center" : "left"
          }}>
            <Typography variant={isMobile ? "h6" : "h4"} sx={{ fontWeight: "bold", lineHeight: 1 }}>
              MedHelper
            </Typography>
            {!isMobile && (
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                Easier appointments. Smarter diagnoses. Powered by AI.
              </Typography>
            )}
          </div>

          {!isMobile && (
            <div style={{ position: "relative", width: "40%", marginLeft: "-20px" }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Enter the name of the test, clinic, or laboratory"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    border: "none",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiInputBase-root": { pl: 2, color: "#000" },
                  "& .MuiInputBase-input": { color: "#000" }
                }}
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: 8, color: "gray" }} />
                }}
              />
              {showSuggestions && (searchResults.analyses.length > 0 || searchResults.hospitals.length > 0) && (
                <Box sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  zIndex: 1200,
                  maxHeight: 300,
                  overflowY: "auto",
                  borderRadius: "0 0 8px 8px",
                  color: "#000"
                }}>
                  {searchResults.analyses.map(item => (
                    <MenuItem
                      key={`a-${item.id}`}
                      sx={{ color: "#000" }}
                      onClick={() => navigate(`/catalog-of-tests?testId=${item.id}`)}
                    >
                      🧪 {item.title}
                    </MenuItem>
                  ))}
                  {searchResults.hospitals.map(item => (
                    <MenuItem
                      key={`h-${item.id}`}
                      sx={{ color: "#000" }}
                      onClick={() => { navigate(`/clinics/${item.id}`); }}
                    >
                      🏥 {item.name}
                    </MenuItem>
                  ))}
                </Box>
              )}
            </div>
          )}

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "5px" : "10px",
            marginLeft: isMobile ? "auto" : 0
          }}>
            {!isMobile && (
              <>
                <IconButton color="inherit" onClick={() => setCityModalOpen(true)} sx={{ "&:hover": { color: "#FFA500" } }}>
                  <FaMapMarkerAlt />
                </IconButton>
                <Typography variant="body2">{city}</Typography>
              </>
            )}

            <IconButton color="inherit" onClick={(e) => setLanguageAnchorEl(e.currentTarget)} sx={{ "&:hover": { color: "#FFA500" } }}>
              <FaGlobe />
            </IconButton>
            {!isMobile && <Typography variant="body2">{language}</Typography>}

            {isAuthenticated && (
              <IconButton color="inherit" onClick={handleCartClick} sx={{ "&:hover": { color: "#FFA500" } }}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {isAuthenticated ? (
                <IconButton color="inherit" onClick={handleAvatarClick} sx={{ "&:hover": { color: "#FFA500" } }}>
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "#FFA500", fontSize: 14 }}>U</Avatar>
                  </motion.div>
                </IconButton>
              ) : (
                <Button color="inherit" onClick={() => setAuthModalOpen(true)} sx={{ "&:hover": { color: "#FFA500" }, fontSize: isMobile ? "0.75rem" : "inherit" }}>
                  {isMobile ? "Login" : "Log In"}
                </Button>
              )}
            </motion.div>

            {isMobile && (
              <IconButton color="inherit" onClick={() => setCityModalOpen(true)} sx={{ "&:hover": { color: "#FFA500" } }}>
                <FaMapMarkerAlt />
              </IconButton>
            )}
          </div>
        </Toolbar>

        {!isMobile && (
          <Toolbar sx={{ justifyContent: "center", minHeight: "40px" }}>
            {navItems.map(item => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => handleNavClick(item)}
                sx={{
                  borderBottom: location.pathname === item.path ? "2px solid white" : "none",
                  borderRadius: 0,
                  mx: 1,
                  fontSize: "12px",
                  fontWeight: location.pathname === item.path ? "bold" : "normal",
                  textTransform: "none",
                  paddingY: "5px",
                  "&:hover": { color: "#FFA500" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Toolbar>
        )}
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 250, backgroundColor: "#001A00", color: "white" } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">MedHelper</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Easier appointments. Smarter diagnoses.
          </Typography>
        </Box>
        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        <List>
          {navItems.map(item => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavClick(item)}
              sx={{
                borderBottom: location.pathname === item.path ? "2px solid white" : "none",
                "&:hover": { color: "#FFA500" },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
            <FaMapMarkerAlt style={{ marginRight: 8 }} />
            {city}
          </Typography>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <FaGlobe style={{ marginRight: 8 }} />
            {language}
          </Typography>
        </Box>
      </Drawer>

      <LoginModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleSuccessfulLogin}
      />

      <Modal open={cityModalOpen} onClose={() => setCityModalOpen(false)}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          boxShadow: 24,
          p: 3,
          borderRadius: "10px",
          minWidth: "250px",
          textAlign: "center",
          width: isMobile ? "80%" : "auto"
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Choose your city</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {["Almaty"].map(cityOption => (
              <MenuItem
                key={cityOption}
                onClick={() => {
                  setCity(cityOption);
                  setCityModalOpen(false);
                  localStorage.setItem("selectedCity", cityOption);
                }}
                sx={{ "&:hover": { color: "#FFA500" }, cursor: "pointer" }}
              >
                {cityOption}
              </MenuItem>
            ))}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Header; 