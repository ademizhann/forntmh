import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import { 
  Card, 
  Typography, 
  Box, 
  Button, 
  Collapse, 
  useMediaQuery,
  useTheme,
  IconButton
} from "@mui/material";
import { 
  ExpandMore, 
  LightbulbOutlined, 
  Close 
} from "@mui/icons-material";

export default function HomepageHealthTips() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [expandedTip, setExpandedTip] = useState(null);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const navigate = useNavigate();
  
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestTips = async () => {
      try {
        const { data } = await api.get('/healthtips/articles/', {
          params: { 
            page: 1,
            page_size: 4,
            ordering: '-created_at'
          }
        });
        
        const formattedTips = (data.results || data).map(article => ({
          id: article.id,
          title: article.title,
          short_description: article.excerpt || article.short_description,
          full_description: article.content,
          slug: article.slug
        }));
        
        setTips(formattedTips);
      } catch (err) {
        console.error('Error loading latest tips:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestTips();
  }, []);

  const getWidgetStyles = () => {
    return {
      backgroundColor: "rgba(63, 78, 61, 0.95)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      position: isMobile ? "fixed" : "absolute",
      bottom: isMobile ? 0 : undefined,
      left: isMobile ? 0 : "20px",
      right: isMobile ? 0 : undefined,
      top: isMobile ? undefined : "0px",
      width: isMobile ? "100%" : "280px",
      height: isMobile ? (isExpandedMobile ? "90vh" : "40vh") : "550px",
      transition: isMobile ? "height 0.3s ease" : "none"
    };
  };

  const handleTipToggle = (tipId) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  const handleSeeMore = () => {
    navigate("/health-tips");
  };

  return (
    <Box sx={getWidgetStyles()}>
      <Box sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <Typography variant="h6" color="white" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LightbulbOutlined fontSize="medium" />
          Health Tips
        </Typography>
        
        {isMobile && (
          <IconButton 
            onClick={() => setIsExpandedMobile(!isExpandedMobile)}
            sx={{ color: "white" }}
          >
            {isExpandedMobile ? <Close /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>

   
      <Box sx={{
        flex: 1,
        overflowY: "auto",
        p: 2,
        minHeight: 0, 
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '3px',
        }
      }}>
        <Box sx={{ 
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card 
                key={`skeleton-${index}`}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "#fefefe",
                  overflow: "hidden",
                  p: 1.5,
                  height: 100
                }}
              >
                <Typography variant="subtitle2" sx={{ bgcolor: "#eee", width: "60%", height: 20, mb: 1 }} />
                <Typography variant="body2" sx={{ bgcolor: "#eee", width: "90%", height: 16 }} />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Typography sx={{ bgcolor: "#eee", width: 80, height: 24 }} />
                </Box>
              </Card>
            ))
          ) : tips.length > 0 ? (
            tips.map((tip) => (
              <Card 
                key={tip.id}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "#fefefe",
                  overflow: "hidden"
                }}
              >
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tip.short_description}
                  </Typography>

                  <Collapse in={expandedTip === tip.id}>
                    <Box sx={{ 
                      maxHeight: "200px", 
                      overflowY: "auto",
                      mt: 1,
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: '2px',
                      }
                    }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          wordBreak: "break-word",
                          overflowWrap: "break-word"
                        }}
                      >
                        {tip.full_description}
                      </Typography>
                    </Box>
                  </Collapse>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Button
                      size="small"
                      onClick={() => handleTipToggle(tip.id)}
                      endIcon={<ExpandMore sx={{
                        transform: expandedTip === tip.id ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease"
                      }} />}
                      sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: "#4a8c4a"
                      }}
                    >
                      {expandedTip === tip.id ? "Show Less" : "Read More"}
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))
          ) : (
            <Typography color="white" textAlign="center" py={2}>
              No health tips available
            </Typography>
          )}
        </Box>
      </Box>

     
      <Box sx={{ 
        p: 2, 
        borderTop: "1px solid rgba(255,255,255,0.1)",
        textAlign: "center" 
      }}>
        <Button 
          variant="text" 
          size="small" 
          onClick={handleSeeMore}
          sx={{ 
            color: "white",
            fontWeight: "medium",
            "&:hover": { textDecoration: "underline" } 
          }}
        >
          See more Health Tips →
        </Button>
      </Box>
    </Box>
  );
} 