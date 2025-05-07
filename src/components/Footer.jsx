import { Box, Container, Typography, Stack, Link, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa"; 

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Catalog of Tests", path: "/catalog-of-tests" },
    { label: "Clinics & Laboratories", path: "/clinics" },
    { label: "Health Tips", path: "/health-tips" },
  ];

  return (
    <Box sx={{ bgcolor: "#001A00", color: "white", pt: 6, pb: 4, mt: "auto" }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold">MedHelper</Typography>
              <Typography variant="body2">
                Easier appointments. Smarter diagnoses. Powered by AI.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              {/* Социальные иконки с react-icons */}
              <IconButton component="a" href="https://www.instagram.com/ademizhann?igsh=MWloZWhvMmVjanN4dw%3D%3D&utm_source=qr" target="_blank" rel="noopener" sx={{ bgcolor: "white" }}>
                <FaInstagram size={20} style={{ color: "#000" }} />
              </IconButton>
              <IconButton component="a" href="https://t.me/aromashkaaaaaaaa" target="_blank" rel="noopener" sx={{ bgcolor: "white" }}>
                <FaTelegram size={20} style={{ color: "#000" }} />
              </IconButton>
              <IconButton component="a" href="https://wa.me/77475910535" target="_blank" rel="noopener" sx={{ bgcolor: "white" }}>
                <FaWhatsapp size={20} style={{ color: "#000" }} />
              </IconButton>
            </Stack>
          </Stack>

          <Box sx={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", py: 4 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={4} justifyContent="space-between">
              {/* Описание */}
              <Box flex={1}>
                <Typography variant="body2">
                  Your health, our priority. With MedHelper, you get instant access to trusted doctors,
                  expert advice, and AI-powered recommendations — all in one place.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Quick Links
                </Typography>
                <Stack spacing={1}>
                  {quickLinks.map((link) => (
                    <Link
                      key={link.path}
                      component="button"
                      onClick={() => navigate(link.path)}
                      underline="hover"
                      color="inherit"
                      sx={{ textAlign: "left" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Help & Support
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">📧 210107166@stu.sdu.edu.kz</Typography>
                  <Typography variant="body2">📍 Abylaikhan Str. 1/1</Typography>
                  <Typography variant="body2">📞 +77070700707</Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Typography variant="caption" textAlign="center" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} MedHelper. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
