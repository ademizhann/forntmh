import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, useTheme, alpha, Collapse, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircleOutline, LocationOn, AccessTime, ExpandMore, Phone } from '@mui/icons-material';


const ClinicCard = ({ clinic }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Grid item xs={12} sm={6} md={3}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{ padding: '10px' }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            border: `1px solid ${alpha('#001A00', 0.08)}`,
            transition: 'all 0.3s ease',
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              boxShadow: `0 8px 16px ${alpha('#001A00', 0.12)}`,
            }
          }}
        >
          <CardContent sx={{ p: 2.5, textAlign: 'left' }}>
            <Typography 
              variant="h6" 
              component="div"
              sx={{
                fontWeight: 600,
                color: '#001A00',
                mb: 1.5,
                fontSize: '1.1rem',
              }}
            >
              {clinic.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <CheckCircleOutline 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  color: '#4CAF50',
                  fontSize: '0.9rem'
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: alpha('#001A00', 0.7)
                }}
              >
                Verified Partner
              </Typography>
            </Box>

           
            <Box sx={{ display: 'flex', mb: 1.5 }}>
              <LocationOn 
                sx={{ 
                  mr: 0.5, 
                  color: alpha('#001A00', 0.7),
                  fontSize: '0.9rem',
                  mt: '2px'
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.8rem',
                  color: alpha('#001A00', 0.8),
                  lineHeight: 1.4
                }}
              >
                {clinic.address}
              </Typography>
            </Box>
            
           
            <Box sx={{ display: 'flex', mb: 1 }}>
              <AccessTime 
                sx={{ 
                  mr: 0.5, 
                  color: alpha('#001A00', 0.7),
                  fontSize: '0.9rem',
                  mt: '2px'
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.8rem',
                  color: alpha('#001A00', 0.8)
                }}
              >
                {clinic.hours}
              </Typography>
            </Box>
          
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: alpha('#001A00', 0.6)
                }}
              >
                More information
              </Typography>
              <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
                size="small"
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                  color: alpha('#001A00', 0.6)
                }}
              >
                <ExpandMore fontSize="small" />
              </IconButton>
            </Box>
            
         
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha('#001A00', 0.1)}` }}>
              
                <Box sx={{ display: 'flex', mb: 1.5 }}>
                  <Phone 
                    sx={{ 
                      mr: 0.5, 
                      color: alpha('#001A00', 0.7),
                      fontSize: '0.9rem',
                      mt: '2px'
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.8rem',
                      color: alpha('#001A00', 0.8)
                    }}
                  >
                    {clinic.phone}
                  </Typography>
                </Box>
                
               
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.8rem',
                    color: alpha('#001A00', 0.8),
                    mb: 0.5
                  }}
                >
                  <strong>Services:</strong>
                </Typography>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '1rem', 
                  fontSize: '0.8rem',
                  color: alpha('#001A00', 0.8)
                }}>
                  {clinic.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

const MainCatalog = () => {
  const theme = useTheme();
  
  const clinics = [
    { 
      id: 1, 
      name: 'Invitro', 
      address: '32 Kunayeva st, Almaty', 
      hours: 'Mon-Fri: 7:00-19:00, Sat-Sun: 7:00-19:00',
      phone: '+7 (707) 258-58-58',
      services: ['Laboratory tests', 'Ultrasonography', 'Genetic tests']
    },
    { 
      id: 2, 
      name: 'KDL Olymp', 
      address: '89B Shevchenko St, Almaty', 
      hours: 'Mon-Fri: 7:00-17:00, Sat: 8:00-13:00',
      phone: '+7 (727) 259-79-69',
      services: ['Laboratory tests', 'Genetic tests', 'Allergy tests']
    },
    { 
      id: 3, 
      name: 'Emirmed', 
      address: '37v Rozybakiev St, Almaty', 
      hours: 'Service available 24 hours a day, 7 days a week',
      phone: '+7 (708) 911-37-90',
      services: ['Laboratory tests', 'Therapy & Consultations', ' Diagnostics']
    },
    { 
      id: 4, 
      name: 'Invivo', 
      address: '123 Karasai Batyr St, Almaty', 
      hours: 'Mon-Fri: 7:30-22:00, Sat: 8:00-13:00',
      phone: '+7 778 769 38 81',
      services: ['Laboratory tests', 'Genetic tests', 'Diagnostics: CT, Ultrasound, MRI']
    },
  ];

  const cardVariants = {
    offscreen: {
      y: 40,
      opacity: 0
    },
    onscreen: i => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.2,
        duration: 0.6,
        delay: i * 0.1
      }
    })
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 6, md: 10 },
       
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/maintwo.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: -1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
         
          zIndex: -1
        },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Box sx={{ 
        maxWidth: '90%', 
        mx: 'auto', 
        px: { xs: 3, sm: 4, md: 5 }, 
        position: 'relative'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              mb: 1.5,
              lineHeight: 1.2,
              color: '#001A00',
              position: 'relative',
              display: 'inline-block',
              mx: 'auto',
              width: '100%',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                background: '#4CAF50',
                borderRadius: '2px'
              }
            }}
          >
            Our Partner Clinics
          </Typography>
          
          <Typography
            variant="subtitle1"
            textAlign="center"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              mb: { xs: 5, md: 6 },
              mt: 2.5,
              fontSize: { xs: '0.95rem', md: '1rem' },
              color: alpha('#001A00'),
              fontWeight: 500,
            }}
          >
            We collaborate with Almaty's leading medical laboratories to provide you with 
            reliable testing
          </Typography>
        </motion.div>

        <Grid 
          container 
          spacing={4} 
          justifyContent="center"
        >
          {clinics.map((clinic, index) => (
            <motion.div
              key={clinic.id}
              style={{ width: '100%', display: 'contents' }}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.1 }}
              custom={index}
              variants={cardVariants}
            >
              <ClinicCard clinic={clinic} />
            </motion.div>
          ))}
        </Grid>

        <Box textAlign="center" mt={{ xs: 6, md: 7 }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="contained"
              size="large"
              href="/clinics"
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#001A00',
                boxShadow: `0 4px 12px ${alpha('##001A00', 0.2)}`,
                '&:hover': {
                  backgroundColor: '#FFA500',
                  boxShadow: `0 4px 14px ${alpha('#FFA500', 0.3)}`
                },
                '&:active': {
                  backgroundColor: '#FFA500',
                }
              }}
            >
              View All Partner Clinics
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default MainCatalog;