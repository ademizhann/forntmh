import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

const VerificationCodeComponent = ({ 
  email, 
  onVerify, 
  onResend, 
  onBack,
  isLoading,
  verificationError,
  verificationSuccess
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [resendTimeout, setResendTimeout] = useState(60);

  useEffect(() => {
    if (resendTimeout > 0) {
      const timer = setTimeout(() => setResendTimeout(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimeout]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) return;
    onVerify(verificationCode);
  };

  const handleResendCode = async () => {
    if (resendTimeout > 0) return;
    await onResend();
    setResendTimeout(60);
  };

  return (
    <Paper elevation={3} sx={{
      width: '320px',
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Typography variant="h6" align="center" sx={{ mb: 1, color: '#001A00', fontWeight: 600 }}>
        Verify Your Email
      </Typography>
      
      <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
        We've sent a 6-digit code to {email}
      </Typography>
      
      {verificationSuccess ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Email verified successfully! Logging you in...
        </Alert>
      ) : (
        <>
          <TextField
            fullWidth
            placeholder="Verification Code"
            variant="outlined"
            size="small"
            value={verificationCode}
            onChange={handleChange}
            error={!!verificationError}
            helperText={verificationError}
            inputProps={{ 
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            sx={{ mb: 2 }}
            autoFocus
          />
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6}
            sx={{
              mb: 1,
              bgcolor: '#001A00',
              '&:hover': { bgcolor: '#FFA500' },
              textTransform: 'none',
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Verifying...
              </>
            ) : 'Verify Email'}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={handleResendCode}
            disabled={isLoading || resendTimeout > 0}
            sx={{ 
              mb: 0.5,
              color: '#001A00',
              '&:hover': { 
                bgcolor: resendTimeout > 0 ? 'transparent' : 'rgba(0, 26, 0, 0.08)',
                textDecoration: resendTimeout > 0 ? 'none' : 'underline' 
              },
              textTransform: 'none',
            }}
          >
            {resendTimeout > 0 ? `Resend in ${resendTimeout}s` : 'Resend Code'}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={onBack}
            disabled={isLoading}
            sx={{ 
              color: '#001A00',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              textTransform: 'none',
            }}
          >
            Back to Registration
          </Button>
        </>
      )}
    </Paper>
  );
};

const AuthModal = ({ open, onClose, onLogin, initialResetToken = null }) => {
  const [searchParams] = useSearchParams();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const resetEmailInputRef = useRef(null);
  const newPasswordInputRef = useRef(null);
  const [uidb64, setUidb64] = useState(null);
  const [resetToken, setResetToken] = useState(initialResetToken || null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "", 
    password2: "", 
  });

  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetMessageType, setResetMessageType] = useState("error");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetFormMessage, setResetFormMessage] = useState("");
  const [resetFormMessageType, setResetFormMessageType] = useState("error");
  const [resetSuccess, setResetSuccess] = useState(false);

  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    // Пример: /password-reset-confirm/abc123/xyz456/
    const match = window.location.pathname.match(/password-reset-confirm\/([^/]+)\/([^/]+)/);
    if (match) {
      setUidb64(match[1]);
      setResetToken(match[2]);
      setShowResetPassword(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (resetToken && newPasswordInputRef.current) {
          newPasswordInputRef.current.focus();
        } else if (showResetPassword && resetEmailInputRef.current) {
          resetEmailInputRef.current.focus();
        } else if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      }, 100);
    }
  }, [open, resetToken, showResetPassword, isRegistering]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email) return setError("Email is required");
    if (!formData.password) return setError("Password is required");
    if (isRegistering) {
      if (!formData.fullname) return setError("Full name is required");
      if (formData.password.length < 8)
        return setError("Password must be at least 8 characters");
      if (formData.password !== formData.password2)
        return setError("Passwords do not match");
    }
    return true;
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const makeApiCall = async (endpoint, method, body, errorMessage) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail) {
          throw new Error(data.detail);
        } else if (data.email) {
          throw new Error(data.email[0]);
        } else if (data.password) {
          throw new Error(data.password[0]);
        } else if (data.non_field_errors) {
          throw new Error(data.non_field_errors[0]);
        } else {
          throw new Error(errorMessage || "Request failed");
        }
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (endpoint, body, isRegister = false) => {
    if (!validateForm()) return;

    try {
      const data = await makeApiCall(
        endpoint,
        "POST",
        body,
        isRegister ? "Registration failed" : "Authentication failed"
      );
      
      if (isRegister) {
        setShowVerification(true);
      } else {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("accessToken", data.access_token);
        onLogin(data.access_token);
        onClose();
      }
    } catch (err) {
      setError(err.message || 
        (isRegister 
          ? "Registration failed. Please try again." 
          : "Authentication failed. Please check your credentials.")
      );
    }
  };

  const handleSignIn = () =>
    handleAuth("/api/auth/login/", {
      email: formData.email,
      password: formData.password,
    });

  const handleSignUp = () =>
    handleAuth(
      "/api/auth/register/", 
      {
        email: formData.email,
        password: formData.password,
        fullname: formData.fullname, 
        password2: formData.password2, 
      }, 
      true
    );

  const handleVerifyCode = async (code) => {
    try {
      await makeApiCall(
        "/api/auth/verify-email/",
        "POST",
        { otp: code },
        "Verification failed"
      );
      
      setVerificationSuccess(true);
      setTimeout(() => {
        handleAuth("/api/auth/login/", {
          email: formData.email,
          password: formData.password,
        });
      }, 1500);
    } catch (error) {
      setVerificationError(error.message || "Invalid verification code. Please try again.");
    }
  };

  const handleResendCode = async () => {
    try {
      await makeApiCall(
        "/api/auth/resend-otp/",
        "POST",
        { email: formData.email },
        "Failed to resend code"
      );
      
      setVerificationError("");
      alert("New verification code sent to your email!");
    } catch (error) {
      setVerificationError(error.message || "Failed to resend code. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetMessage("Please enter your email.");
      setResetMessageType("error");
      return;
    }

    try {
      await makeApiCall(
        "/api/auth/request-password-reset/",
        "POST",
        { email: resetEmail },
        "Failed to send reset link"
      );
      
      setResetMessage("Reset instructions sent! Please check your email.");
      setResetMessageType("success");
    } catch (error) {
      setResetMessage(error.message || "Failed to send reset link. Please try again.");
      setResetMessageType("error");
    }
  };

  const handleSubmitNewPassword = async () => {
    if (!newPassword) {
      setResetFormMessage("Password is required");
      setResetFormMessageType("error");
      return;
    }
    if (newPassword.length < 8) {
      setResetFormMessage("Password must be at least 8 characters");
      setResetFormMessageType("error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetFormMessage("Passwords do not match");
      setResetFormMessageType("error");
      return;
    }

    try {
      await makeApiCall(
        "/api/auth/set-new-password/",
        "PATCH",
        { uidb64, token: resetToken, password: newPassword },
        "Failed to reset password"
      );
      
      setResetSuccess(true);
      setResetFormMessage("Your password has been reset successfully!");
      setResetFormMessageType("success");
      
      setTimeout(() => {
        setShowResetPassword(false);
        setResetToken(null);
      }, 3000);
    } catch (error) {
      setResetFormMessage(error.message || "Failed to reset password. The link may be expired.");
      setResetFormMessageType("error");
    }
  };

  const renderResetPasswordForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
  {uidb64 && resetToken ? "Create New Password" : "Invalid Reset Link"}
</Typography>
{!(uidb64 && resetToken) ? (
  <Alert severity="error" sx={{ mb: 2 }}>
    The password reset link is invalid or expired.
  </Alert>
) : resetSuccess ? (
  
        <Alert severity="success" sx={{ mb: 2 }}>
          {resetFormMessage}
        </Alert>
      ) : (
        <>
          <TextField
            inputRef={newPasswordInputRef}
            size="small"
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleSubmitNewPassword)}
            sx={{ mb: 2 }}
            disabled={isLoading}
            autoFocus
          />
          <TextField
            size="small"
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleSubmitNewPassword)}
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
          {resetFormMessage && (
            <Alert severity={resetFormMessageType} sx={{ mb: 2 }}>
              {resetFormMessage}
            </Alert>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ 
              bgcolor: "#001A00", 
              color: "white", 
              "&:hover": { bgcolor: "#FFA500" },
              "&:disabled": { bgcolor: "#e0e0e0" }
            }}
            onClick={handleSubmitNewPassword}
            disabled={isLoading || !(uidb64 && resetToken)}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : "Save New Password"}
          </Button>
        </>
      )}
    </>
  );

  const renderRequestResetForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        Reset Password
      </Typography>
      <TextField
        inputRef={resetEmailInputRef}
        size="small"
        fullWidth
        label="Enter your email"
        value={resetEmail}
        onChange={(e) => setResetEmail(e.target.value)}
        onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
        disabled={isLoading}
        autoFocus
      />
      <Button
        fullWidth
        variant="contained"
        sx={{ 
          mt: 2, 
          bgcolor: "#001A00", 
          color: "white", 
          "&:hover": { bgcolor: "#FFA500" } 
        }}
        onClick={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : "Send Reset Link"}
      </Button>
      {resetMessage && (
        <Alert severity={resetMessageType} sx={{ mt: 2 }}>
          {resetMessage}
        </Alert>
      )}
      <Button
        variant="text"
        sx={{ 
          mt: 2, 
          color: "#001A00", 
          "&:hover": { bgcolor: "rgba(0, 26, 0, 0.08)" } 
        }}
        onClick={() => setShowResetPassword(false)}
        disabled={isLoading}
      >
        Back to Sign In
      </Button>
    </>
  );

  const renderMainForm = () => (
    <>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2, color: "#001A00" }}>
        {isRegistering ? "Create an Account" : "Welcome!"}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
        {isRegistering && (
          <TextField
            size="small"
            fullWidth
            label="Full Name"
            name="fullname" 
            value={formData.fullname}
            onChange={handleChange}
            disabled={isLoading}
          />
        )}
        <TextField
          inputRef={emailInputRef}
          size="small"
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onKeyPress={(e) => handleKeyPress(e, isRegistering ? handleSignUp : handleSignIn)}
          disabled={isLoading}
          autoFocus
        />
        <TextField
          inputRef={passwordInputRef}
          size="small"
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onKeyPress={(e) => handleKeyPress(e, isRegistering ? handleSignUp : handleSignIn)}
          disabled={isLoading}
        />
        {isRegistering && (
          <TextField
            size="small"
            fullWidth
            label="Confirm Password"
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            onKeyPress={(e) => handleKeyPress(e, handleSignUp)}
            disabled={isLoading}
          />
        )}
        <Button
          fullWidth
          variant="contained"
          sx={{
            borderRadius: "20px",
            bgcolor: "#001A00",
            color: "white",
            py: 1,
            "&:hover": { bgcolor: "#FFA500" },
          }}
          onClick={isRegistering ? handleSignUp : handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isRegistering ? "Sign Up" : "Sign In"}
        </Button>
        <Box sx={{ position: "relative", width: "100%", my: 1 }}>
          <Divider sx={{ my: 1, bgcolor: "#40916C" }} />
          <Typography
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              px: 1,
              fontSize: "0.85rem",
              color: "#001A00",
            }}
          >
            OR
          </Typography>
        </Box>
        {!isRegistering && (
          <Button
            variant="text"
            sx={{
              color: "#001A00",
              fontSize: "0.85rem",
              textTransform: "none",
              "&:hover": { 
                bgcolor: "rgba(0, 26, 0, 0.08)", 
                textDecoration: "underline" 
              },
            }}
            onClick={() => setShowResetPassword(true)}
            disabled={isLoading}
          >
            Forgot Password?
          </Button>
        )}
        <Button
          variant="text"
          sx={{
            mt: 1,
            color: "#001A00",
            fontSize: "0.9rem",
            textTransform: "none",
            "&:hover": { 
              bgcolor: "rgba(0, 26, 0, 0.08)", 
              textDecoration: "underline" 
            },
          }}
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
          }}
          disabled={isLoading}
        >
          {isRegistering 
            ? "Already have an account? Sign in" 
            : "Don't have an account? Register here"}
        </Button>
      </Box>
    </>
  );

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: '95%', sm: 420, md: 440 },
        minWidth: 320,
        maxWidth: 480,
        maxHeight: "90vh",
        overflowY: "auto",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        outline: "none",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Typography 
        variant="h4" 
        fontWeight="bold" 
        sx={{ 
          mb: 2, 
          color: "#001A00",
          textAlign: "center"
        }}
      >
        MedHelper
      </Typography>
      
      {showVerification ? (
        <VerificationCodeComponent
          email={formData.email}
          onVerify={handleVerifyCode}
          onResend={handleResendCode}
          onBack={() => {
            setShowVerification(false);
            setError("");
          }}
          isLoading={isLoading}
          verificationError={verificationError}
          verificationSuccess={verificationSuccess}
        />
      ) : resetToken ? (
        renderResetPasswordForm()
      ) : showResetPassword ? (
        renderRequestResetForm()
      ) : (
        renderMainForm()
      )}
    </Box>
  </Modal>
  );
};

export default AuthModal;