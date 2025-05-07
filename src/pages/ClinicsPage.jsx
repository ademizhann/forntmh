import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Box, Typography, Button, Avatar, Rating, Card, CardContent,
  CardActions, Grid, Chip, Paper, Container, TextField, InputAdornment, Divider,
  Fab, Zoom
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalHospital as ClinicIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';

const ClinicTests = ({ tests }) => {
  const [expanded, setExpanded] = useState(false);
  const display = expanded ? tests : tests.slice(0, 3);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Available Tests:
      </Typography>
      <Grid container spacing={1}>
        {display.map(test => (
          <Grid item xs={12} sm={6} md={4} key={test.id}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'rgba(0, 26, 0, 0.02)',
                borderRadius: 1,
                border: '1px solid rgba(0, 26, 0, 0.08)',
                height: '100%',
              }}
            >
              <Chip
                label={test.category}
                size="small"
                sx={{
                  mb: 1,
                  bgcolor: 'rgba(0, 26, 0, 0.08)',
                  color: '#001A00',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {test.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                  }}
                >
                  <TimeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                  {test.ready}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {parseFloat(test.price).toLocaleString()} ₸
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      {tests.length > 3 && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: '#001A00', textTransform: 'none', fontSize: '0.85rem' }}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Свернуть' : `Показать ещё ${tests.length - 3} тестов`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const ClinicsPage = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const primaryColor = '#001A00';

  // ref для скролла к списку
  const listRef = useRef(null);

  // состояние для показа кнопки "Вверх"
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analysisRes, hospitalsRes, reviewsRes] = await Promise.all([
          api.get('/analysis/'),
          api.get('/analysis/hospitals/'),
          api.get('/analysis/hospital-reviews/'),
        ]);

        const analyses = Array.isArray(analysisRes.data)
          ? analysisRes.data
          : analysisRes.data.results || [];
        const hospitals = Array.isArray(hospitalsRes.data)
          ? hospitalsRes.data
          : hospitalsRes.data.results || [];
        const reviews = Array.isArray(reviewsRes.data)
          ? reviewsRes.data
          : reviewsRes.data.results || [];

        const data = hospitals.map(h => {
          const tests = analyses.filter(a => a.lab_info?.id === h.id);
          const rv = reviews.filter(r => r.hospital === h.id);
          const count = rv.length;
          const avg = count
            ? (rv.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
            : 0;
          return {
            id: h.id,
            name: h.name,
            logo: h.photo,
            address: h.address,
            working_time: h.working_time,
            tests,
            rating: parseFloat(avg),
            reviews: count,
          };
        });

        setClinics(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setFiltered(
      clinics.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tests.some(t =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }, [searchTerm, clinics]);

  // Обработчик скролла для показа кнопки
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Функция скролла к началу списка клиник
  const scrollToTop = () => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const go = id => navigate(`/clinics/${id}`);
  const goRv = (id, e) => { e.stopPropagation(); navigate(`/clinics/${id}#reviews`); };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: primaryColor }}>
          Analysis clinics in Almaty
        </Typography>

        <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', borderRadius: 2, boxShadow: '0px 2px 15px rgba(0,0,0,0.05)' }}>
          <TextField
            fullWidth
            placeholder="Search the name of clinics"
            variant="outlined"
            size="medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
        </Paper>

        {/* ref для скролла */}
        <div ref={listRef} />

        <Grid container spacing={3}>
          {loading
            ? <Typography>Loading...</Typography>
            : filtered.map(c => (
              <Grid item xs={12} key={c.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0px 2px 15px rgba(0,0,0,0.05)',
                    '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }
                  }}
                  onClick={() => go(c.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar src={c.logo} sx={{ width: 64, height: 64, bgcolor: 'rgba(0,26,0,0.08)', color: primaryColor }}>
                          <ClinicIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, cursor: 'pointer', color: primaryColor, '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => go(c.id)}
                          >
                            {c.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Rating value={c.rating} precision={0.1} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#FFAB00' } }} />
                            <Typography
                              variant="body2"
                              sx={{ ml: 1, color: 'text.secondary', cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: primaryColor } }}
                              onClick={e => goRv(c.id, e)}
                            >
                              {c.rating} ({c.reviews} отзывов)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Address:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>{c.address}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                        Working hours: {c.working_time}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <ClinicTests tests={c.tests} />
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowIcon />}
                      onClick={() => go(c.id)}
                      sx={{
                        mr: 2,
                        borderColor: primaryColor,
                        color: primaryColor,
                        '&:hover': { borderColor: primaryColor, backgroundColor: 'rgba(0,26,0,0.04)' },
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      More about the tests
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          }
        </Grid>
      </Container>

      {/* Кнопка "Вверх" справа сверху */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          aria-label="scroll back to top"
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            bgcolor: '#004d00', // тёмно-зелёный
            '&:hover': { bgcolor: '#003300' }
          }}
        >
          <ArrowUpIcon />
        </Fab>
      </Zoom>
    </>
  );
};

export default ClinicsPage;