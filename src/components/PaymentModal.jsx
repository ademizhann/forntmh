import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Slide,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  Box
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import MastercardLogo from "../assets/mastercard.svg";
import VisaLogo from "../assets/visa.svg";
import api from "../api/axios";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PaymentModal({ open, onClose, cart, onSuccess, onError }) {
  const theme = useTheme();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentYY = currentYear % 100;
  const currentMM = now.getMonth() + 1;

  const [form, setForm] = useState({
    card_number: "",
    exp_month: "",
    exp_year: "",
    cvc: ""
  });
  const [saving, setSaving] = useState(false);

  const formatCardNumber = (value) =>
    value
      .replace(/[^0-9]/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value.replace(/[^0-9]/g, "");
    if (name === "card_number") v = formatCardNumber(value);
    setForm((p) => ({ ...p, [name]: v }));
  };

 
  const num = (v) => parseInt(v || "0", 10);

  const isValidMonth = () => {
    const m = num(form.exp_month);
    return m >= 1 && m <= 12;
  };

  const isValidYear = () => {
    if (form.exp_year.length === 0) return false;
    const y = form.exp_year.length === 2 ? 2000 + num(form.exp_year) : num(form.exp_year);
    return y >= currentYear && y <= currentYear + 10;
  };

  const isDateInFuture = () => {
    if (!isValidMonth() || !isValidYear()) return false;
    const y = form.exp_year.length === 2 ? 2000 + num(form.exp_year) : num(form.exp_year);
    const m = num(form.exp_month);
    return y > currentYear || (y === currentYear && m >= currentMM);
  };

  const isCardFilled = () => form.card_number.replace(/\s/g, "").length >= 12;
  const isCvcValid = () => form.cvc.length >= 3 && form.cvc.length <= 4;

  const formValid = isCardFilled() && isValidMonth() && isValidYear() && isDateInFuture() && isCvcValid();


  const clean = {
    ...form,
    card_number: form.card_number.replace(/\s/g, ""),
    exp_year: form.exp_year.length === 2 ? `20${form.exp_year}` : form.exp_year
  };

  const pay = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/cart/checkout/", { payment: clean });
      onSuccess(data);
      onClose();
    } catch (err) {
      console.log("detail ⇒", err.response?.data);
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  
  const CardPreview = () => (
    <Box
      sx={{
        position: "relative",
        height: 160,
        borderRadius: 3,
        p: 3,
        color: "common.white",
        background: "linear-gradient(135deg, #4a8c4a 0%, #1a5f1a 100%)",
        boxShadow: 4,
        mb: 3
      }}
    >
      <Box
        component="img"
        src={VisaLogo}
        alt="visa"
        sx={{ width: 56, position: "absolute", top: 16, right: 16, opacity: 0.8 }}
      />
      <Typography variant="h6" letterSpacing={2} sx={{ mt: 4 }}>
        {form.card_number || "•••• •••• •••• ••••"}
      </Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Typography variant="body2">
          {form.exp_month && form.exp_year ? `${form.exp_month}/${form.exp_year}` : "MM/YY"}
        </Typography>
        <Box component="img" src={MastercardLogo} alt="mc" sx={{ width: 34, opacity: 0.9 }} />
      </Stack>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: `0 8px 32px ${theme.palette.grey[500_24] || "rgba(0,0,0,.24)"}`
        }
      }}
    >
      
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, bgcolor: "success.main", color: "common.white" }}>
        <DialogTitle sx={{ p: 0, typography: "h6" }}>
          Payment {cart ? `— ${cart.total_price.toLocaleString()} ₸` : ""}
        </DialogTitle>
        <IconButton onClick={onClose} sx={{ color: "inherit" }} size="small">
          <CloseIcon />
        </IconButton>
      </Stack>

      <DialogContent sx={{ px: 4, pt: 3, pb: 1 }}>
        <CardPreview />

        <Stack spacing={3}>
          <TextField
            label="Card number"
            name="card_number"
            value={form.card_number}
            onChange={handleChange}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="MM"
              name="exp_month"
              value={form.exp_month}
              onChange={handleChange}
              placeholder="04"
              error={form.exp_month !== "" && !isValidMonth()}
              helperText={form.exp_month !== "" && !isValidMonth() ? "1‑12" : ""}
              sx={{ width: 100 }}
              inputProps={{ maxLength: 2 }}
            />
            <TextField
              label="YY"
              name="exp_year"
              value={form.exp_year}
              onChange={handleChange}
              placeholder="30"
              error={form.exp_year !== "" && !isValidYear()}
              helperText={form.exp_year !== "" && !isValidYear() ? `≥${currentYY}` : ""}
              sx={{ width: 100 }}
              inputProps={{ maxLength: 2 }}
            />
            <TextField
              label="CVC"
              name="cvc"
              value={form.cvc}
              onChange={handleChange}
              placeholder="123"
              error={form.cvc !== "" && !isCvcValid()}
              helperText={form.cvc !== "" && !isCvcValid() ? "3‑4 digits" : ""}
              sx={{ width: 100 }}
              inputProps={{ maxLength: 4 }}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
            <LockIcon fontSize="small" sx={{ mr: 0.5 }} /> Your payment is secured and encrypted.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
    variant="contained"
    onClick={pay}
    disabled={!formValid || saving}
    sx={{ 
      textTransform: "none", 
      ml: 1, 
      minWidth: 140, 
      borderRadius: 8,
      backgroundColor: '#1a5f1a',
      '&:hover': { backgroundColor: '#4a8c4a' }
    }}
  >
    {saving ? <CircularProgress size={24} color="inherit" /> : `Pay ${cart ? cart.total_price.toLocaleString() : ""} ₸`}
  </Button>
      </DialogActions>
    </Dialog>
  );
}