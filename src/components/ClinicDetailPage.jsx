import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Rating,
  Divider,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  Modal,
  Stack,
  TextField,
  Fade,
  CircularProgress,
  useTheme,
  styled
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AccessTime as TimeIcon,
  ArrowBack as BackIcon,
  LocalHospital as ClinicIcon,
  Category as CategoryIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Оранжевая цветовая палитра
const orangePalette = {
  main: '#FF9800',
  light: '#FFB74D',
  dark: '#F57C00',
  contrastText: '#fff'
};

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #004D00 0%, #001A00 100%)',
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[4],
}));

const ReviewCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}));

const TestCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
}));

const TestCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
}));

const DetailModal = ({ open, onClose, record }) => {
  const theme = useTheme();
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 360,
        bgcolor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.shadows[8],
        p: theme.spacing(4),
      }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ color: orangePalette.main, fontWeight: 600 }}>
            {record.analysis?.title || 'Details'}
          </Typography>
          <Typography><strong>Price:</strong> {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'KZT' }).format(record.analysis?.price || 0)}</Typography>
          <Typography><strong>Date:</strong> {record.test_date ? format(new Date(record.test_date), 'dd MMM yyyy') : '-'}</Typography>
          <Typography>
            <strong>Status:</strong>{' '}
            <Chip
              label={record.status}
              color={{ pending: 'info', processing: 'warning', completed: 'success', rejected: 'error' }[record.status]}
              size="small"
            />
          </Typography>
          <Typography><strong>Hospital:</strong> {record.hospital?.name || '-'}</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Button 
              variant="contained" 
              sx={{
                backgroundColor: orangePalette.main,
                color: orangePalette.contrastText,
                '&:hover': {
                  backgroundColor: orangePalette.dark
                }
              }}
              onClick={onClose}
            >
              Close
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

const ClinicDetailPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [clinic, setClinic] = useState(null);
  const [tests, setTests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analysisRes, hospitalsRes, reviewsRes] = await Promise.all([
          api.get('/analysis/'),
          api.get('/analysis/hospitals/'),
          api.get('/analysis/hospital-reviews/', { params: { hospital: id } })
        ]);

        const analysesData = analysisRes.data;
        const hospitalsData = hospitalsRes.data;
        const reviewsData = reviewsRes.data;

        const analyses = Array.isArray(analysesData)
          ? analysesData
          : Array.isArray(analysesData.results)
            ? analysesData.results
            : [];
        const hospitals = Array.isArray(hospitalsData)
          ? hospitalsData
          : Array.isArray(hospitalsData.results)
            ? hospitalsData.results
            : [];
        const rv = Array.isArray(reviewsData)
          ? reviewsData
          : Array.isArray(reviewsData.results)
            ? reviewsData.results
            : [];

        const found = hospitals.find(h => h.id === parseInt(id, 10));
        if (found) {
          setClinic(found);
          setTests(analyses.filter(a => a.lab_info?.id === found.id));
          setReviews(rv);
        } else {
          setClinic(null);
          setTests([]);
          setReviews([]);
        }
      } catch (e) {
        console.error(e);
        setClinic(null);
        setTests([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBack = () => navigate('/clinics');

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.rating || !newReview.comment.trim()) return;
    try {
      await api.post('/analysis/hospital-reviews/', {
        hospital: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      const rres = await api.get('/analysis/hospital-reviews/', { params: { hospital: id } });
      const rvData = Array.isArray(rres.data)
        ? rres.data
        : Array.isArray(rres.data.results)
          ? rres.data.results
          : [];
      setReviews(rvData);
      setNewReview({ rating: 0, comment: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: theme.spacing(10) }}>
        <CircularProgress sx={{ color: orangePalette.main }} />
      </Box>
    );
  }

  if (!clinic) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          startIcon={<BackIcon />} 
          onClick={handleBack}
          sx={{
            backgroundColor: orangePalette.main,
            color: orangePalette.contrastText,
            '&:hover': {
              backgroundColor: orangePalette.dark
            }
          }}
        >
          Back to clinics
        </Button>
      </Box>
    );
  }

  const rvCount = reviews.length;
  const avg = rvCount ? (reviews.reduce((sum, r) => sum + r.rating, 0) / rvCount).toFixed(1) : '0.0';

  return (
    <Box sx={{ maxWidth: 1200, m: '0 auto', p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      <Button 
        variant="text" 
        startIcon={<BackIcon sx={{ color: orangePalette.main }} />} 
        onClick={handleBack} 
        sx={{ 
          mb: 2, 
          textTransform: 'none',
          color: orangePalette.main,
          '&:hover': {
            backgroundColor: 'rgba(255, 152, 0, 0.08)'
          }
        }}
      >
        Back to clinics
      </Button>

      <GradientPaper>
        <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap">
          <Avatar src={clinic.photo} sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'rgba(255,255,255,0.2)', 
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <ClinicIcon sx={{ fontSize: 40, color: orangePalette.main }} />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>{clinic.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Rating
                value={parseFloat(avg)}
                precision={0.1}
                readOnly
                icon={<StarIcon sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorderIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />}
              />
              <Typography sx={{ ml: 1.5 }}>{avg} ({rvCount})</Typography>
            </Box>
          </Box>
        </Stack>
      </GradientPaper>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: orangePalette.main
        }}>
          <LocationIcon sx={{ color: orangePalette.main }} /> Address & Hours
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0px 1px 5px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Address</Typography>
                <Typography>{clinic.address}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Working Hours</Typography>
                <Typography sx={{ fontStyle: 'italic' }}>{clinic.working_time}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: orangePalette.main
        }}>
          <ClinicIcon sx={{ color: orangePalette.main }} /> Available Tests
        </Typography>
        <Grid container spacing={2}>
          {tests.map(test => (
            <Grid item xs={12} sm={6} md={4} key={test.id}>
              <TestCard>
                <TestCardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1,
                    minHeight: '3em'
                  }}>
                    <Typography sx={{ 
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {test.title}
                    </Typography>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      color: orangePalette.main,
                      whiteSpace: 'nowrap'
                    }}>
                      {parseFloat(test.price).toLocaleString()} ₸
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    mt: 'auto'
                  }}>
                    <Chip 
                      icon={<TimeIcon fontSize="small" />} 
                      label={test.ready} 
                      size="small" 
                      sx={{ fontSize: '0.75rem' }} 
                    />
                    <Chip 
                      icon={<CategoryIcon fontSize="small" />} 
                      label={test.category} 
                      size="small" 
                      sx={{ fontSize: '0.75rem' }} 
                    />
                  </Box>
                </TestCardContent>
              </TestCard>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: orangePalette.main
        }}>
          <StarIcon sx={{ color: orangePalette.main }} /> Patient Reviews
        </Typography>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography sx={{ mb: 2, fontWeight: 600 }}>Leave Your Review</Typography>
          <Box component="form" onSubmit={submitReview}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Your Rating:</Typography>
              <Rating
                value={newReview.rating}
                onChange={(e, v) => setNewReview({ ...newReview, rating: v })}
                precision={1}
                icon={<StarIcon sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorderIcon sx={{ color: 'rgba(0,0,0,0.26)' }} />}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Share your experience with this clinic..."
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={!newReview.rating || !newReview.comment.trim()}
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 500,
                  backgroundColor: orangePalette.main,
                  color: orangePalette.contrastText,
                  '&:hover': {
                    backgroundColor: orangePalette.dark
                  }
                }}
              >
                Submit Review
              </Button>
            </Box>
            <Fade in={submitted}>
              <Typography sx={{ mt: 1, color: theme.palette.success.main, fontWeight: 500, textAlign: 'center' }}>
                Thank you! Your review has been submitted.
              </Typography>
            </Fade>
          </Box>
        </Paper>

        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewCard key={review.id} elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      bgcolor: orangePalette.light, 
                      color: orangePalette.contrastText,
                      mr: 2 
                    }}>
                      {review.user_email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{review.user_email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    icon={<StarIcon sx={{ color: '#FFD700' }} />}
                    emptyIcon={<StarBorderIcon sx={{ color: 'rgba(0,0,0,0.26)' }} />}
                  />
                </Box>
                <Typography sx={{ pl: 6 }}>{review.comment}</Typography>
              </CardContent>
            </ReviewCard>
          ))
        ) : (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">No reviews yet. Be the first to leave one!</Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default ClinicDetailPage; 