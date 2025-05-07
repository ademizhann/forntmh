import React, { useState } from 'react';
import {
  Box,
  Modal,
  Typography,
  Button,
  Divider,
  IconButton,
  Rating,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../api/axios';

const primaryColor = '#1a5f1a';
const primaryLight = '#4a8c4a';
const primaryDark = '#003600';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: '80%' },
  maxWidth: 800,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  overflowY: 'auto',
  p: { xs: 2, md: 4 },
  '&:focus-visible': { outline: 'none' },
  '&::-webkit-scrollbar': { width: '6px' },
  '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
  '&::-webkit-scrollbar-thumb': {
    background: primaryColor,
    borderRadius: '10px',
    '&:hover': { background: primaryDark }
  },
  scrollbarWidth: 'thin',
  scrollbarColor: `${primaryColor} #f1f1f1`
};

const defaultTest = {
  title: "",
  description: "",
  lab: "",
  price: 0,
  ready: "",
  rating: 0,
  reviews: 0,
  about: "",
  preparation: []
};

const availableTimes = [
  '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45', '13:00'
];

const getAvailableDates = () => {
  const today = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });
};

const TestDetailsModal = ({ open, handleClose, test = {}, onCartUpdate, isAuthenticated, setAuthModalOpen }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const availableDates = getAvailableDates();

  const currentTest = {
    ...defaultTest,
    ...test,
    preparation: test && test.preparation
      ? (Array.isArray(test.preparation)
        ? test.preparation
        : test.preparation.split('\n').filter(item => item.trim()))
      : []
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason !== 'clickaway') setSnackbarOpen(false);
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showNotification('Please log in or register to book an analysis', 'warning');
      setAuthModalOpen(true);
      return;
    }
    setIsLoading(true);
    const requestData = {
      analysis_id: currentTest.id,
      quantity: 1,
      scheduled_date: selectedDate,
      scheduled_time: selectedTime
    };

    api.post('/cart/add/', requestData)
      .then((res) => {
        showNotification(`${currentTest.title} added to cart`);
        setIsLoading(false);
        setTimeout(handleClose, 1500);
        if (window.updateCartBadge) window.updateCartBadge();
        if (onCartUpdate) onCartUpdate();
      })
      .catch((err) => {
        showNotification("Error adding to cart", "error");
        setIsLoading(false);
      });
  };

  const handleTakeNowClick = () => {
    if (!isAuthenticated) {
      showNotification('Please log in or register to book an analysis', 'warning');
      setAuthModalOpen(true);
      return;
    }
    setActiveTab('schedule');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigateToLabPage = () => {
    showNotification(`Opening ${currentTest.lab} page`, 'info');
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const filteredDates = availableDates.filter(date =>
        formatDate(date).toLowerCase().includes(query.toLowerCase())
      );

      const filteredTimes = availableTimes.filter(time =>
        time.toLowerCase().includes(query.toLowerCase())
      );

      const mockResults = [
        ...filteredDates.map(date => ({ type: 'date', value: date, display: formatDate(date) })),
        ...filteredTimes.map(time => ({ type: 'time', value: time, display: time }))
      ];

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 300);
  };

  const handleSearchResultClick = (result) => {
    if (result.type === 'date') {
      setSelectedDate(result.value);
    } else if (result.type === 'time') {
      setSelectedTime(result.value);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const commonButtonStyle = {
    borderColor: primaryLight,
    color: primaryColor,
    '&:hover': {
      borderColor: primaryColor,
      backgroundColor: `${primaryLight}10`
    }
  };

  const tabButtonStyle = (tab) => ({
    borderBottom: activeTab === tab ? '2px solid' : 'none',
    borderColor: primaryColor,
    borderRadius: 0,
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    color: activeTab === tab ? primaryColor : 'text.primary',
    '&:hover': { backgroundColor: `${primaryLight}08` }
  });

  const renderDetailsTab = () => (
    <>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Test Description
      </Typography>
      <Typography paragraph sx={{ lineHeight: 1.7 }}>
        {currentTest.description || <span style={{ color: '#888' }}>No description available.</span>}
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        About This Test
      </Typography>
      <Typography paragraph sx={{ lineHeight: 1.7 }}>
        {currentTest.about || <span style={{ color: '#888' }}>No information.</span>}
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Preparation Instructions
      </Typography>
      {currentTest.preparation.length > 0 ? (
        <Box
          component="ul"
          sx={{
            pl: 2, mb: 3,
            '& li': { mb: 1.5, pl: 1, lineHeight: 1.6 }
          }}
        >
          {currentTest.preparation.map((item, i) => (
            <Box component="li" key={i}>
              <Typography variant="body2">{item}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
          No preparation instructions.
        </Typography>
      )}
    </>
  );

  const renderScheduleTab = () => (
    <Box>
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search for dates or times..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: primaryColor },
            '& .MuiInputLabel-root.Mui-focused': { color: primaryColor }
          }}
        />

        {searchResults.length > 0 && (
          <Box
            sx={{
              mt: 1,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 1,
              maxHeight: 200,
              overflowY: 'auto',
              position: 'absolute',
              zIndex: 10,
              bgcolor: 'white',
              width: 'calc(100% - 64px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            <List dense disablePadding>
              {searchResults.map((result, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSearchResultClick(result)}
                  divider={index < searchResults.length - 1}
                  sx={{
                    py: 1,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {result.type === 'date' ?
                      <CalendarTodayIcon fontSize="small" sx={{ color: primaryColor }} /> :
                      <AccessTimeIcon fontSize="small" sx={{ color: primaryColor }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.display}
                    secondary={result.type === 'date' ? 'Date' : 'Time'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>

      <Box
        p={3}
        bgcolor="rgba(0, 0, 0, 0.03)"
        borderRadius={2}
        borderLeft={`4px solid ${primaryColor}`}
      >
        <Typography variant="subtitle1" fontWeight="bold" mb={3}>
          Choose Date and Time
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
          <TextField
            select
            fullWidth
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputProps={{
              startAdornment: <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
            }}
            SelectProps={{ native: true }}
          >
            <option value="">Select date</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Time"
            value={selectedTime}
            disabled={!selectedDate}
            onChange={(e) => setSelectedTime(e.target.value)}
            InputProps={{
              startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />
            }}
            SelectProps={{ native: true }}
          >
            <option value="">Select time</option>
            {availableTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </TextField>
        </Stack>
        <Box
          bgcolor="white"
          p={3}
          borderRadius={2}
          mb={3}
          boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)"
        >
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Order Summary
          </Typography>
          {['Test', 'Lab', 'Date', 'Time'].map((label) => (
            <Box key={label} display="flex" justifyContent="space-between" mb={1.5}>
              <Typography>{label}:</Typography>
              <Typography fontWeight="medium">
                {label === 'Test' ? currentTest.title :
                  label === 'Lab' ? currentTest.lab :
                    label === 'Date' ? (selectedDate ? formatDate(selectedDate) : '—') :
                      selectedTime || '—'}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Total:</Typography>
            <Typography fontWeight="bold" sx={{ color: primaryColor }}>
              {currentTest.price.toLocaleString()} ₸
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleAddToCart}
          disabled={!selectedDate || !selectedTime || isLoading}
          startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <ShoppingCartIcon />}
          sx={{
            py: 1.5,
            backgroundColor: primaryColor,
            '&:hover': { backgroundColor: primaryDark },
            '&:disabled': { backgroundColor: '#e0e0e0' }
          }}
        >
          {isLoading ? 'Processing...' : 'Add to Cart'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="test-modal">
        <Box sx={modalStyle}>
          {!currentTest.title ? (
            <Typography color="text.secondary">No test data available</Typography>
          ) : (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {currentTest.title}
                  </Typography>
                  <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
                    <Rating
                      value={currentTest.rating}
                      precision={0.1}
                      readOnly
                      size="small"
                      sx={{ color: primaryColor }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {currentTest.rating} ({currentTest.reviews.toLocaleString()} reviews)
                    </Typography>
                    <Chip
                      label={currentTest.lab}
                      size="small"
                      variant="outlined"
                      sx={{ ...commonButtonStyle, cursor: 'pointer' }}
                      icon={<InfoIcon fontSize="small" sx={{ color: primaryColor }} />}
                      onClick={navigateToLabPage}
                      clickable
                    />
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={handleClose}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" sx={{ color: primaryColor }} fontWeight="bold">
                    {currentTest.price.toLocaleString()} ₸
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Results ready in {currentTest.ready}
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    onClick={handleTakeNowClick}
                    startIcon={<CalendarTodayIcon />}
                    sx={{
                      backgroundColor: primaryColor,
                      '&:hover': { backgroundColor: primaryDark }
                    }}
                  >
                    Book Now
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box display="flex" gap={2} mb={3} borderBottom={1} borderColor="divider">
                <Button variant="text" onClick={() => setActiveTab('details')} sx={tabButtonStyle('details')}>
                  Details
                </Button>
                <Button variant="text" onClick={() => setActiveTab('schedule')} sx={tabButtonStyle('schedule')}>
                  Schedule
                </Button>
              </Box>

              {activeTab === 'details' && renderDetailsTab()}
              {activeTab === 'schedule' && renderScheduleTab()}
            </>
          )}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: '100%',
            backgroundColor: snackbarSeverity === 'success' ? primaryColor : undefined
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TestDetailsModal;