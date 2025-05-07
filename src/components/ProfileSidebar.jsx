import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  Divider,
  Badge,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Assignment as ResultsIcon,
  Notifications as NotificationsIcon,
  RateReview as ReviewsIcon,
} from "@mui/icons-material";

import ProfileSettings from "./ProfileSettings";
import TestHistory from "./TestHistory";
import Notifications from "./Notifications";
import MyRevProfile from "./MyRevProfile";

const drawerWidth = 280;

const ProfileSidebar = () => {
  const [open, setOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleUpdateUnreadCount = (count) => {
    setUnreadNotifications(count);
  };

  const toggleDrawer = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userEmail");
    window.location.reload();
  };

  const menuItems = [
    { id: "profile", text: "Profile & Settings", icon: <SettingsIcon /> },
    { id: "test-history", text: "Test Information", icon: <ResultsIcon /> },
    {
      id: "notifications",
      text: "Notifications",
      icon: <NotificationsIcon />,
      badge: unreadNotifications,
    },
    { id: "my-reviews", text: "My Reviews", icon: <ReviewsIcon /> },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f1f1f1" }}>
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: "fixed",
          left: 16,
          top: 16,
          zIndex: 1200,
          bgcolor: "#f5f5f5",
          "&:hover": { bgcolor: "#e0e0e0" },
          display: { xs: "flex", md: "none" },
        }}
        aria-label="toggle menu"
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant={open ? "permanent" : "temporary"}
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: { xs: "100%", md: drawerWidth-270},
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "100%", md: drawerWidth },
            boxSizing: "border-box",
            bgcolor: "#f5f5f5",
            borderRight: "1px solid #e0e0e0",
            position: "relative",
            height: "100%",
          },
        }}
      >
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.id}
              selected={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
              sx={{
                py: 1.5,
                px: 2,
                my: 0.5,
                borderRadius: 1,
                bgcolor: activeSection === item.id ? "#e8f5e9" : "transparent",
                "&:hover": {
                  bgcolor: activeSection === item.id ? "#e8f5e9" : "#eeeeee",
                },
                "&.Mui-selected": {
                  color: "#2e7d32",
                  "& .MuiListItemIcon-root": { color: "#2e7d32" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: activeSection === item.id ? 500 : 400,
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            my: 0.5,
            borderRadius: 1,
            "&:hover": { bgcolor: "#ffebee" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Log Out"
            primaryTypographyProps={{ fontSize: "0.875rem" }}
          />
        </ListItem>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          ml: { xs: 0, md: open ? `${drawerWidth}px` : 0 },
          transition: "margin 225ms cubic-bezier(0, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            height: "100%",
          }}
        >
          <Box
            sx={{
              flex: "1 1 auto",
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
              p: 4,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {activeSection === "profile" ? (
              <ProfileSettings />
            ) : activeSection === "test-history" ? (
              <TestHistory />
            ) : activeSection === "notifications" ? (
              <Notifications updateUnreadCount={handleUpdateUnreadCount} />
            ) : activeSection === "my-reviews" ? (
              <MyRevProfile />
            ) : (
              <Typography variant="h6" color="textSecondary">
                {menuItems.find((m) => m.id === activeSection)?.text
                  ? `${menuItems.find((m) => m.id === activeSection).text} section content will be loaded here`
                  : "Section not found"}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSidebar; 