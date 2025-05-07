import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Box, 
  IconButton,
  Skeleton 
} from "@mui/material";
import Rating from "@mui/material/Rating";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/testimonials.json');
        
        if (!response.ok) {
          throw new Error('Failed to load reviews');
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError(err.message);
       
      
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#D1653E",
        py: 1,
        px: 2,
        textAlign: "center",
        width: "100%",
        minHeight: 300,
        position: "relative",
        zIndex: 20,
        
        
      }}
    >
      <Typography 
        variant="h6" 
        color="white" 
        fontWeight="bold" 
        gutterBottom
        sx={{ mb: 1 }}
      >
        Real Stories, Real Impact
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        position: "relative"
      }}>
        <IconButton 
          className="swiper-button-prev" 
          sx={{ 
            color: "white",
            position: "absolute",
            left: { xs: 0, sm: 20 },
            zIndex: 2
          }}
        >
          <ArrowBackIos />
        </IconButton>

        {loading ? (
          <Box sx={{ 
            display: "flex", 
            gap: 2,
            width: "100%",
            justifyContent: "center"
          }}>
            {[1, 2, 3].map((item) => (
              <Card key={item} sx={{ 
                width: 300, 
                height: 180,
                p: 2,
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.8)"
              }}>
                <Skeleton variant="rectangular" width="100%" height={28} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
                <Box display="flex" alignItems="center" gap={1}>
                  <Skeleton variant="circular" width={25} height={25} />
                  <Skeleton variant="text" width={100} height={20} />
                </Box>
              </Card>
            ))}
          </Box>
        ) : (
          <Swiper
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            navigation={{ 
              nextEl: ".swiper-button-next", 
              prevEl: ".swiper-button-prev" 
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: false,
            }}
            modules={[EffectCoverflow, Navigation]}
            style={{ 
              width: "100%", 
              maxWidth: "90%",
              padding: "10px 0"
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 10
              },
              600: {
                slidesPerView: 2,
                spaceBetween: 20
              },
              900: {
                slidesPerView: 3,
                spaceBetween: 30
              }
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide 
                key={review.id} 
                style={{ 
                  width: 300,
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <Card
                  sx={{
                    height: 200,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 3,
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.15)",
                    backgroundColor: "white",
                    textAlign: "center",
                    overflow: "hidden",
                  }}
                >
                  <CardContent
                    sx={{
                      overflow: "auto",
                      height: "100%",
                      "::-webkit-scrollbar": { display: "none" },
                      "-ms-overflow-style": "none",
                      "scrollbar-width": "none",
                    }}
                  >
                    <Rating 
                      value={review.rating} 
                      readOnly 
                      precision={0.5} 
                      size="medium" 
                    />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      mt={1}
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {review.text}
                    </Typography>
                  </CardContent>
                  <Box mt={1} display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Avatar sx={{ 
                      bgcolor: "#F97316", 
                      width: 28, 
                      height: 28,
                      fontSize: "0.9rem"
                    }}>
                      {review.name[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {review.name}
                    </Typography>
                  </Box>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <IconButton 
          className="swiper-button-next" 
          sx={{ 
            color: "white",
            position: "absolute",
            right: { xs: 0, sm: 20 },
            zIndex: 2
          }}
        >
          <ArrowForwardIos />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Reviews;