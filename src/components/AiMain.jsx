import React from 'react';
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AiMain = () => {
  const navigate = useNavigate();

  const handleStartNow = () => {
    navigate('/checkai'); 
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: "-125px",
        left: '35%',
        width: '750px',
        height: '1000px',
        background: 'url(/path-to-background-image) no-repeat center center',
        backgroundSize: 'cover',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1000px',
          background: 'rgba(63, 78, 61, 0.7)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            marginBottom: '16px'  
          }}
        >
          CheckAI
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            marginBottom: '24px',
            opacity: 0.7 
          }}
        >
          YOUR PERSONAL HEALTH ASSISTANT
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'white', 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto',
            opacity: 0.8 
          }}
        >
          Got health questions? CheckAI provides instant insights, analyzes reports, 
          and offers expert-backed recommendations – anytime, anywhere.
        </Typography>
        
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#001A00',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '100px',
            top: '20px',
            textTransform: 'none',
            fontSize: '16px',
            '&:hover': {
              backgroundColor: 'orange'
            }
          }}
          onClick={handleStartNow}
        >
          Start Now
        </Button>
      </Box>
    </Box>
  );
};

export default AiMain;