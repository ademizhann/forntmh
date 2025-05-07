import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  styled
} from "@mui/material";
import {
  Close,
  Notifications as NotificationsIcon,
  Refresh,
  ExpandMore
} from "@mui/icons-material";
import api from "../api/axios";

const COLORS = {
  primary: '#004d00',
  darkPrimary: '#001A00',
  lightPrimary: '#e6f0e6',
  hoverLight: '#f5f5f5',
  hoverDark: '#d9e6d9',
};

const ITEMS_PER_PAGE = 10;
const SYNC_INTERVAL = 60000;

const ScrollContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '& .scroll-content': {
    flex: 1,
    overflowY: 'auto',
    paddingRight: theme.spacing(1),
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.grey[400],
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.grey[100],
    }
  }
}));

const NotificationItem = styled(ListItem)(({ isRead }) => ({
  borderRadius: 8,
  marginBottom: 8,
  backgroundColor: isRead ? 'inherit' : COLORS.lightPrimary,
  '&:hover': {
    backgroundColor: isRead ? COLORS.hoverLight : COLORS.hoverDark
  },
  position: 'relative',
}));

const Notifications = ({ updateUnreadCount }) => {
  const [settings, setSettings] = useState({
    test_reminders: true,
    result_alerts: true
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [syncingData, setSyncingData] = useState(false);

  // Fetch notification settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get("/notifications/settings/");
      setSettings({
        test_reminders: response.data.test_reminders ?? true,
        result_alerts: response.data.result_alerts ?? true
      });
      return true;
    } catch (err) {
      setError("Failed to load notification settings");
      showSnackbar("Failed to load settings", "error");
      return false;
    }
  }, []);

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setSyncingData(true);
      else if (pageNum === 1) setInitialLoading(true);
      else setLoading(true);

      const response = await api.get("/notifications/", {
        params: {
          page: pageNum,
          page_size: ITEMS_PER_PAGE
        }
      });

      const newNotifications = response.data.results;

      setNotifications(prev => {
        if (refresh || pageNum === 1) return newNotifications;
        else return [...prev, ...newNotifications];
      });

      setHasMore(!!response.data.next);
      setError(null);

      return newNotifications;
    } catch (err) {
      setError("Failed to load notifications");
      showSnackbar("Failed to load notifications", "error");
      return null;
    } finally {
      setInitialLoading(false);
      setLoading(false);
      setSyncingData(false);
    }
  }, []);

  // Snackbar helper
  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setInitialLoading(true);
      await fetchSettings();
      await fetchNotifications(1);
      setInitialLoading(false);
    };
    initialize();
    const syncInterval = setInterval(() => {
      fetchNotifications(1, true);
    }, SYNC_INTERVAL);
    return () => clearInterval(syncInterval);
  }, [fetchSettings, fetchNotifications]);

  // Load more notifications when page changes
  useEffect(() => {
    if (page > 1) fetchNotifications(page);
  }, [page, fetchNotifications]);

  // Save settings
  const saveSettings = useCallback(async (newSettings) => {
    setSavingSettings(true);
    try {
      await api.put("/notifications/settings/", newSettings);
      setSettings(newSettings);
      showSnackbar("Settings saved", "success");
    } catch (err) {
      showSnackbar("Failed to save settings", "error");
    } finally {
      setSavingSettings(false);
    }
  }, [showSnackbar]);

  // Toggle setting
  const handleSettingChange = useCallback((setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Mark as read
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/mark-read/`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      showSnackbar("Failed to mark as read", "error");
    }
  }, [showSnackbar]);

  // Delete notification
  const deleteNotification = useCallback(async (id, event) => {
    if (event) event.stopPropagation();
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showSnackbar("Notification deleted", "success");
    } catch (err) {
      showSnackbar("Failed to delete notification", "error");
    }
  }, [showSnackbar]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && !syncingData && hasMore) setPage(prev => prev + 1);
  }, [loading, syncingData, hasMore]);

  // Refresh notifications
  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      let dateKey;
      if (date.toDateString() === today.toDateString()) dateKey = "Today";
      else if (date.toDateString() === yesterday.toDateString()) dateKey = "Yesterday";
      else dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(notification);
    });
    return groups;
  }, [notifications]);

  // Count unread notifications
  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  // Update unread count in parent
  useEffect(() => {
    if (settings.test_reminders || settings.result_alerts) {
      updateUnreadCount(unreadCount);
    } else {
      updateUnreadCount(0);
    }
  }, [unreadCount, settings, updateUnreadCount]);

  return (
    <ScrollContainer role="region" aria-label="Notifications">
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          justifyContent: 'space-between'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            transform: 'translateY(-5px)',
            ml: -0.5
          }}>
            <NotificationsIcon sx={{
              mr: 1,
              fontSize: 24,
              color: COLORS.darkPrimary
            }} />
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              color: COLORS.darkPrimary
            }}>
              Notifications
            </Typography>
            {(settings.test_reminders || settings.result_alerts) && unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{ ml: 2 }}
                aria-label={`${unreadCount} unread notifications`}
              />
            )}
          </Box>
          <Box>
            <IconButton
              onClick={handleRefresh}
              disabled={initialLoading || syncingData}
              sx={{ color: COLORS.primary }}
              aria-label="Refresh notifications"
            >
              {(initialLoading || syncingData) ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Refresh />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* Notification settings */}
        <Paper elevation={0} sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          position: 'relative'
        }}>
          {savingSettings && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              zIndex: 1
            }}
              aria-live="polite"
              aria-label="Saving settings"
            >
              <CircularProgress size={24} />
            </Box>
          )}

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: COLORS.darkPrimary, mb: 2 }}>
            Notification Settings
          </Typography>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: COLORS.hoverLight }
          }}>
            <Box>
              <Typography sx={{ color: COLORS.darkPrimary, fontSize: '0.9rem' }}>
                Test Reminders
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.primary, fontSize: '0.8rem' }}>
                Receive reminders about upcoming tests
              </Typography>
            </Box>
            <Switch
              checked={settings.test_reminders}
              onChange={() => handleSettingChange('test_reminders')}
              color="primary"
              size="small"
              disabled={savingSettings || initialLoading}
              inputProps={{
                'aria-label': 'Enable test reminders'
              }}
            />
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: COLORS.hoverLight }
          }}>
            <Box>
              <Typography sx={{ color: COLORS.darkPrimary, fontSize: '0.9rem' }}>
                Results Alerts
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.primary, fontSize: '0.8rem' }}>
                Notify when test results are available
              </Typography>
            </Box>
            <Switch
              checked={settings.result_alerts}
              onChange={() => handleSettingChange('result_alerts')}
              color="primary"
              size="small"
              disabled={savingSettings || initialLoading}
              inputProps={{
                'aria-label': 'Enable results alerts'
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Notifications list */}
      <Box className="scroll-content">
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{
            fontWeight: 'bold',
            color: COLORS.darkPrimary,
            mb: 2,
            px: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Recent Notifications</span>
            {syncingData && notifications.length > 0 && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Typography>

          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={30} sx={{ color: COLORS.primary }} />
            </Box>
          ) : error && notifications.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              p: 3,
              color: '#FF3B30',
              bgcolor: 'rgba(255,59,48,0.05)',
              borderRadius: 2
            }}>
              <Typography variant="body2">{error}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRefresh}
                sx={{ mt: 1, color: COLORS.primary, borderColor: COLORS.primary }}
              >
                Try Again
              </Button>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              p: 3,
              color: COLORS.primary,
              bgcolor: 'rgba(0,77,0,0.03)',
              borderRadius: 2
            }}>
              <Typography variant="body2">
                No notifications available
              </Typography>
            </Box>
          ) : (
            <>
              {Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
                <Box key={dateGroup} sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 'medium',
                      color: COLORS.primary,
                      px: 1
                    }}
                  >
                    {dateGroup}
                  </Typography>
                  <List dense>
                    {notifs.map((notification) => (
                      <React.Fragment key={notification.id}>
                        <NotificationItem
                          isRead={notification.read}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                          button
                          aria-label={notification.read ? "Read notification" : "Mark as read"}
                        >
                          <ListItemText
                            primary={notification.subject}
                            secondary={
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: COLORS.primary,
                                    fontSize: '0.75rem',
                                    mb: 0.5
                                  }}
                                >
                                  {notification.body}
                                </Typography>
                                <Typography variant="caption" sx={{ color: COLORS.primary }}>
                                  {new Date(notification.created_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </>
                            }
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontWeight: notification.read ? 'normal' : '600',
                                color: COLORS.darkPrimary,
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                          <IconButton
                            edge="end"
                            onClick={(e) => deleteNotification(notification.id, e)}
                            sx={{ color: COLORS.primary }}
                            size="small"
                            aria-label="Delete notification"
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </NotificationItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ))}

              {hasMore && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Button
                    variant="text"
                    onClick={loadMore}
                    disabled={loading || syncingData}
                    startIcon={loading ? <CircularProgress size={16} /> : <ExpandMore />}
                    sx={{ color: COLORS.primary }}
                    aria-label="Load more notifications"
                  >
                    Load More
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ScrollContainer>
  );
};

export default Notifications;