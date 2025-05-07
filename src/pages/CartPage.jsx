import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  Snackbar,
  Alert,
  Badge,
  Chip,
  Stack,
  useMediaQuery,
  CircularProgress,
  Grid,
  GlobalStyles
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ShoppingCart as CartIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PaymentModal from "../components/PaymentModal";

const colors = {
  primary: "#1a5f1a",
  primaryLight: "#4a8c4a",
  primaryDark: "#003600",
  background: "#f8f9fa"
};

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    icon: null
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [quantityEdits, setQuantityEdits] = useState({});
  const [payOpen, setPayOpen] = useState(false);

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");


  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/cart/");
      setCart(data);
      setError("");
    } catch (err) {
      console.error("Cart load error:", err);
      setError("Failed to load cart. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    
   
    const interval = setInterval(fetchCart, 30000); 
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdateQuantity = async (id) => {
    const qty = quantityEdits[id];
    if (!qty || qty < 1) {
      setSnackbar({ open: true, message: "Quantity must be at least 1", severity: "error" });
      return;
    }
    try {
      await api.patch(`/cart/item/${id}/`, { quantity: qty });
      setSnackbar({ open: true, message: "Quantity updated", severity: "success" });
      setEditingItemId(null);
      await fetchCart(); 
    } catch (err) {
      console.error("Update quantity error:", err);
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await api.delete(`/cart/item/${id}/remove/`);
      setSnackbar({
        open: true,
        message: "Item removed",
        severity: "success",
        icon: <CheckCircleIcon fontSize="inherit" />
      });
      await fetchCart(); 
    } catch (err) {
      console.error("Remove item error:", err);
      setSnackbar({ open: true, message: "Remove failed", severity: "error" });
    }
  };

 
  const handleCheckoutSuccess = (data) => {
    setCart({ ...cart, items: [], total_price: 0, final_price: data.final_price || 0 });
    setSnackbar({
      open: true,
      message: data.message || "Order placed successfully!",
      severity: "success",
      icon: <CheckCircleIcon fontSize="inherit" />
    });
    setTimeout(() => navigate("/my-tests", { state: { newRecords: data.records } }), 1500);
  };

  const handleCheckoutError = (err) => {
    console.error("Checkout error:", err);
    const st = err.response?.status;
    if (st === 400) {
      const msg = err.response?.data?.detail || "Invalid payment / empty cart";
      setSnackbar({ open: true, message: msg, severity: "warning" });
    } else if (st === 402) {
      setSnackbar({ open: true, message: "Payment declined", severity: "error" });
    } else {
      setSnackbar({ open: true, message: "Checkout failed", severity: "error" });
    }
  };

  const closeSnack = () => setSnackbar((s) => ({ ...s, open: false }));

  const globalBg = <GlobalStyles styles={{ body: { backgroundColor: colors.background } }} />;

 
  if (loading) {
    return (
      <>
        {globalBg}
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        {globalBg}
        <Box textAlign="center" mt={8} p={3} minHeight="100vh">
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            onClick={fetchCart}
            sx={{ mt: 2, color: colors.primary, borderColor: colors.primary }}
          >
            Retry
          </Button>
        </Box>
      </>
    );
  }

  const isCartEmpty = !cart?.items?.length;

  return (
    <>
      {globalBg}
      <Box
        component="main"
        sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: "auto", minHeight: "100vh" }}
      >
     
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: colors.primary }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700} sx={{ color: colors.primaryDark }}>
            Shopping Cart
          </Typography>
          <Badge
            badgeContent={cart?.items?.length || 0}
            sx={{ ml: 2, "& .MuiBadge-badge": { bgcolor: colors.primary, color: "white" } }}
          >
            <CartIcon color="action" />
          </Badge>
          <IconButton onClick={fetchCart} sx={{ ml: 'auto', color: colors.primary }}>
            <RefreshIcon />
          </IconButton>
        </Stack>

        {isCartEmpty ? (
    
          <Box textAlign="center" mt={8} p={3}>
            <CartIcon fontSize="large" sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Add tests from our catalog to continue
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/catalog-of-tests")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: colors.primary,
                "&:hover": { bgcolor: colors.primaryDark }
              }}
            >
              Back to catalog
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: colors.primary }}>
                      <TableRow>
                        <TableCell sx={{ color: "common.white" }}>Test</TableCell>
                        {!isMobile && (
                          <TableCell align="center" sx={{ color: "common.white" }}>
                            Laboratory
                          </TableCell>
                        )}
                        <TableCell align="center" sx={{ color: "common.white" }}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={{ color: "common.white" }}>
                          Price
                        </TableCell>
                        <TableCell sx={{ color: "common.white" }} />
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {item.analysis.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.analysis.description}
                            </Typography>
                            <Chip
                              label={item.analysis.category}
                              size="small"
                              sx={{ mt: 1, bgcolor: colors.primaryLight, color: "common.white" }}
                            />
                            {isMobile && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                                mt={1}
                              >
                                {item.analysis.lab || "Unknown lab"}
                              </Typography>
                            )}
                          </TableCell>

                          {!isMobile && (
                            <TableCell align="center">
                              <Typography variant="body2">
                                {item.analysis.lab || "Unknown lab"}
                              </Typography>
                            </TableCell>
                          )}

                          <TableCell align="center">
                            {editingItemId === item.id ? (
                              <TextField
                                type="number"
                                size="small"
                                autoFocus
                                value={quantityEdits[item.id] ?? item.quantity}
                                onChange={(e) =>
                                  setQuantityEdits({
                                    ...quantityEdits,
                                    [item.id]: parseInt(e.target.value, 10) || 1
                                  })
                                }
                                sx={{ width: 80 }}
                                inputProps={{ min: 1 }}
                              />
                            ) : (
                              <Typography>{item.quantity}</Typography>
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight={700}>
                              {(item.analysis.price * item.quantity).toLocaleString()} ₸
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.analysis.price.toLocaleString()} ₸ each
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  editingItemId === item.id
                                    ? handleUpdateQuantity(item.id)
                                    : setEditingItemId(item.id)
                                }
                                sx={{
                                  color: editingItemId === item.id ? colors.primary : "inherit"
                                }}
                              >
                                {editingItemId === item.id ? <SaveIcon /> : <EditIcon />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveItem(item.id)}
                                sx={{ color: "error.main" }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" mb={2} fontWeight={700} sx={{ color: colors.primaryDark }}>
                  Order Summary
                </Typography>

                <Stack spacing={1.5} mb={3}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Items ({cart.items.length})</Typography>
                    <Typography>{cart.total_price.toLocaleString()} ₸</Typography>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {(cart.final_price || cart.total_price).toLocaleString()} ₸
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setPayOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    bgcolor: colors.primary,
                    "&:hover": { bgcolor: colors.primaryDark }
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={2}
                  textAlign="center"
                >
                  By clicking the button, you agree to our terms of service
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={closeSnack}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={closeSnack} severity={snackbar.severity} sx={{ width: "100%" }} icon={snackbar.icon}>
            {snackbar.message}
          </Alert>
        </Snackbar>


        {cart && (
          <PaymentModal
            open={payOpen}
            onClose={() => setPayOpen(false)}
            cart={cart}
            onSuccess={handleCheckoutSuccess}
            onError={handleCheckoutError}
          />
        )}
      </Box>
    </>
  );
};

export default CartPage;