import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Divider,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete, Edit, Star, StarBorder } from '@mui/icons-material';
import api from '../api/axios';

const MyRevProfile = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    open: false, 
    reviewId: null,
    clinicName: ''
  });


  const canEditReview = useCallback((reviewDate) => {
    const now = new Date();
    const reviewTime = new Date(reviewDate);
    return (now - reviewTime) < 24 * 60 * 60 * 1000;
  }, []);


  const showSnackbar = useCallback((message, severity = 'info') => {
    console.log(`[Snackbar] ${severity}: ${message}`);
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      try {
        setLoading(true);
        console.log('[Fetch] Loading reviews...');
        const response = await api.get('/analysis/myreviews/', {
          signal: controller.signal
        });

        const data = normalizeReviews(response.data);
        console.log(`[Fetch] Loaded ${data.length} reviews`, data);
        
        setReviews(data);
        setError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('[Fetch] Error:', err);
          setError(err.message || 'Failed to load reviews');
          showSnackbar('Failed to load reviews', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    const normalizeReviews = (apiData) => {
      if (!apiData) return [];
      
    
      const rawData = Array.isArray(apiData) ? apiData : apiData.results || [];
      
      return rawData.map(review => ({
        ...review,
        id: review.id, 
        created_at: review.created_at || review.date || new Date().toISOString()
      }));
    };

    fetchReviews();
    return () => controller.abort();
  }, [showSnackbar]);

  const handleDeleteReview = async (id) => {
    if (!id) {
      console.error('[Delete] No ID provided');
      showSnackbar('Error: no review ID', 'error');
      return;
    }

    try {
      console.log(`[Delete] Starting for ID: ${id} (${typeof id})`);
      
      const response = await api.delete(`/analysis/myreviews/${id}/`);
      console.log('[Delete] Server response:', response);

      setReviews(prev => {
        const updatedReviews = prev.filter(review => {
         
          return String(review.id) !== String(id);
        });
        console.log('[Delete] UI update after successful API call:', updatedReviews);
        return updatedReviews;
      });

      showSnackbar('Review deleted successfully', 'success');
    } catch (err) {
      console.error('[Delete] Error:', err);
      
     
      console.log('[Delete] Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Failed to delete review';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleteConfirm({ open: false, reviewId: null, clinicName: '' });
    }
  };

  
  const handleEditSubmit = async () => {
    if (!editingReview) {
      console.warn('[Edit] No review selected');
      return;
    }

    try {
      if (!canEditReview(editingReview.created_at)) {
        console.warn('[Edit] Time expired for review:', editingReview.id);
        showSnackbar('Editing time has expired (24 hours)', 'error');
        setEditingReview(null);
        return;
      }

      const updatedReview = {
        ...editingReview,
        comment: editComment,
        rating: editRating
      };
      
      console.log('[Edit] Saving:', updatedReview);
      const { data } = await api.put(
        `/analysis/myreviews/${editingReview.id}/`, 
        updatedReview
      );
      
      
      setReviews(prev => prev.map(review => 
        String(review.id) === String(editingReview.id) ? { ...data, id: data.id } : review
      ));
      
      setEditingReview(null);
      showSnackbar('Review updated successfully', 'success');
    } catch (err) {
      console.error('[Edit] Error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Failed to update review';
      showSnackbar(errorMessage, 'error');
    }
  };

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.warn('[Date] Invalid date:', dateString);
      return 'Unknown date';
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 2, color: '#004d00', borderColor: '#004d00' }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2,
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#001A00', fontWeight: 'bold' }}>
        <Star sx={{ mr: 1, color: '#ffc107' }} />
        My Reviews
      </Typography>

      {reviews.length === 0 ? (
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f9f5',
          borderRadius: 1,
          p: 2
        }}>
          <Typography variant="body2" textAlign="center">
            You haven't left any reviews yet.<br />
            Your feedback helps others make better healthcare choices
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
          {reviews.map((review) => (
            <ReviewCard
              key={`review-${review.id}`} // Явный префикс для ключа
              review={review}
              formatDate={formatDate}
              canEdit={canEditReview(review.created_at)}
              onEditClick={() => {
                console.log('[UI] Edit clicked for:', review.id);
                if (canEditReview(review.created_at)) {
                  setEditingReview(review);
                  setEditComment(review.comment);
                  setEditRating(review.rating);
                }
              }}
              onDeleteClick={() => {
                console.log('[UI] Delete clicked for:', review.id);
                setDeleteConfirm({
                  open: true,
                  reviewId: review.id,
                  clinicName: review.clinic_name
                });
              }}
            />
          ))}
        </Box>
      )}

 
      <EditDialog
        open={Boolean(editingReview)}
        onClose={() => setEditingReview(null)}
        editComment={editComment}
        editRating={editRating}
        onCommentChange={setEditComment}
        onRatingChange={setEditRating}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        clinicName={deleteConfirm.clinicName}
        onClose={() => setDeleteConfirm({ open: false, reviewId: null, clinicName: '' })}
        onConfirm={() => handleDeleteReview(deleteConfirm.reviewId)}
      />

 
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};


const ReviewCard = React.memo(({ review, formatDate, canEdit, onEditClick, onDeleteClick }) => {
  console.log(`[Render] ReviewCard ${review.id}`);
  
  return (
    <Card sx={{ mb: 2, borderLeft: '3px solid #4caf50', boxShadow: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {review.clinic_name || 'Unknown Clinic'}
            </Typography>
            {review.comment && (
              <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                "{review.comment}"
              </Typography>
            )}
          </Box>
          <Rating
            value={review.rating}
            readOnly
            precision={0.5}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#004d00' }}>
            Posted {formatDate(review.created_at)}
            {!canEdit && (
              <Typography component="span" variant="caption" sx={{ color: '#d32f2f', ml: 1 }}>
                (editing expired)
              </Typography>
            )}
          </Typography>
          
          <Box>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              disabled={!canEdit}
              sx={{ color: canEdit ? '#004d00' : '#9e9e9e' }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
              sx={{ color: '#d32f2f' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});


const EditDialog = React.memo(({ open, onClose, editComment, editRating, onCommentChange, onRatingChange, onSubmit }) => {
  console.log('[Render] EditDialog');
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Review</DialogTitle>
      <DialogContent>
        <Rating
          value={editRating}
          onChange={(_, newValue) => onRatingChange(newValue)}
          precision={0.5}
          sx={{ my: 2 }}
        />
        <TextField
          multiline
          rows={4}
          fullWidth
          value={editComment}
          onChange={(e) => onCommentChange(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const ConfirmDeleteDialog = React.memo(({ open, clinicName, onClose, onConfirm }) => {
  console.log('[Render] ConfirmDeleteDialog');
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete your review for {clinicName || 'this clinic'}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default MyRevProfile; 