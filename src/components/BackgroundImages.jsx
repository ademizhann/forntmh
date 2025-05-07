import React from "react";
import { Box, useMediaQuery } from "@mui/material";
import MainCatalog from "./MainCatalog"; 

const BackgroundImages = () => {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      <Box
        sx={{
          width: "100%",
          minHeight: isMobile ? "70vh" : "100vh",
          backgroundImage: "url('/secph.png')",
          backgroundSize: isMobile ? "cover" : "cover",
          backgroundPosition: isMobile ? "center center" : "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(111, 172, 78, 0.4)",
            mixBlendMode: "multiply",
            backdropFilter: "blur(3px)",
          },
        }}
      />

    
     

    
    </Box>
  );
};

export default BackgroundImages;