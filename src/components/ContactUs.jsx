import React, { useRef, useState } from "react";
import { useMediaQuery, Divider, Snackbar, Alert } from "@mui/material";
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";
import axios from "axios";

const ContactUs = () => {
  const contactRef = useRef(null);
  const isMobile = useMediaQuery("(max-width:768px)");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isHovering, setIsHovering] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitted(true);
      const response = await axios.post("http://localhost:8000/api/auth/contact/", formData);
      console.log("Form submitted successfully:", response.data);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSnackbar({
        open: true,
        message: "Your message has been sent successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
      if (error.response?.status === 400) {
        setErrors(error.response.data);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to send message. Please try again later.",
          severity: "error"
        });
      }
    } finally {
      setIsSubmitted(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div 
      id="help-support"
      ref={contactRef}
      style={{ 
        width: "100%",
        minHeight: isMobile ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0",
        position: "relative",
        zIndex: 10,
        marginTop: "-2px",
        marginBottom: "-2px",
        backgroundImage: "url('/maintwo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        borderTop: "none",
      }}
    >
      <div style={{
        position: "absolute",
        top: "-5px",
        left: 0,
        right: 0,
        bottom: "-5px",
        backgroundImage: "url('/maintwo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        zIndex: -1,
      }} />
      
      <div style={{
        width: "100%",
        padding: isMobile ? "40px 20px" : "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
          maxWidth: "800px",
          height: "auto",
          minHeight: isMobile ? "auto" : "100px",
          backgroundColor: "rgba(255, 255, 255, 0.97)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          zIndex: 11,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            backgroundColor: "#001A00",
            color: "white",
            padding: isMobile ? "20px" : "30px",
            width: isMobile ? "100%" : "40%",
            order: isMobile ? 2 : 1
          }}>
            <h2 style={{ fontSize: isMobile ? "24px" : "28px", margin: "0 0 20px 0", fontWeight: 600 }}>Get in Touch</h2>
            
            {[
              { icon: "📍", title: "Head Office", text: "Abylaikhan Str. 1/1" },
              { icon: "✉️", title: "Email Us", text: "210107166@stu.sdu.edu.kz" },
              { icon: "📞", title: "Call Us", text: "+7707070707" }
            ].map((item, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "15px", flexShrink: 0 }}>
                  <span style={{ color: "#001A00" }}>{item.icon}</span>
                </div>
                <div>
                  <h3 style={{ margin: "0", fontSize: "16px", fontWeight: 500 }}>{item.title}</h3>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>{item.text}</p>
                </div>
              </div>
            ))}
            
            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />
            
            <p style={{ fontSize: "16px", margin: "20px 0 15px 0", fontWeight: 500 }}>Follow Our Social Media</p>
            
            <div style={{ display: "flex", gap: "15px" }}>
              {[
                { icon: <FaInstagram size={20} />, url: "https://www.instagram.com/ademizhann?igsh=MWloZWhvMmVjanN4dw%3D%3D&utm_source=qr" },
                { icon: <FaTelegram size={20} />, url: "https://t.me/aromashkaaaaaaaa" },
                { icon: <FaWhatsapp size={20} />, url: "https://wa.me/77475910535" }
              ].map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" style={{ width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "transform 0.3s", textDecoration: "none", color: "#001A00" }}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div style={{ padding: isMobile ? "25px" : "30px", width: isMobile ? "100%" : "60%", order: 1 }}>
            <h2 style={{ fontSize: isMobile ? "24px" : "28px", color: "#001A00", margin: "0 0 25px 0", fontWeight: 600 }}>Send Us a Message</h2>
            
            <form onSubmit={handleSubmit}>
              {[
                { type: "text", name: "name", placeholder: "Name", value: formData.name, error: errors.name },
                { type: "email", name: "email", placeholder: "Email Address", value: formData.email, error: errors.email },
                { type: "tel", name: "phone", placeholder: "Phone Number", value: formData.phone, error: errors.phone },
                { type: "text", name: "message", placeholder: "Message", value: formData.message, error: errors.message }
              ].map((field, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      border: "none",
                      borderBottom: field.error ? "1px solid #d32f2f" : "1px solid #ccc",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "rgba(214, 226, 214, 0.8)",
                      borderRadius: "4px",
                    }}
                  />
                  {field.error && (
                    <p style={{ color: "#d32f2f", fontSize: "12px", margin: "5px 0 0 5px" }}>
                      {field.error}
                    </p>
                  )}
                </div>
              ))}
              
              <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                <button
                  type="submit"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  style={{
                    backgroundColor: isSubmitted 
                      ? "rgba(76, 175, 80, 0.8)" 
                      : isHovering 
                        ? "#FFA500"
                        : "#001A00",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    padding: "12px 50px",
                    fontSize: "16px",
                    cursor: isSubmitted ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    width: isMobile ? "100%" : "auto",
                    fontWeight: 500,
                    transform: isHovering && !isSubmitted ? "translateY(-2px)" : "translateY(0)",
                    boxShadow: isHovering && !isSubmitted ? "0 4px 8px rgba(0,0,0,0.1)" : "none"
                  }}
                  disabled={isSubmitted}
                >
                  {isSubmitted ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ContactUs;