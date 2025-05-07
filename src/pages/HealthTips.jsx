import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Card, Container, CardContent, CardActions, 
  Dialog, DialogContent, DialogTitle, Grid, IconButton, 
  Menu, MenuItem, Pagination, Typography, CircularProgress,
  Snackbar, Alert, Skeleton, Chip
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

const API_URL = 'http://localhost:8000/api/healthtips';
const ARTICLES_PER_PAGE = 10;

const ArticleCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={160} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton width="40%" />
      <Skeleton width="100%" height={60} />
    </CardContent>
    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
      <Skeleton width="30%" height={36} />
    </CardActions>
  </Card>
);

const ArticleCard = ({ article, handleArticleOpen }) => (
  <Card sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    borderRadius: 2,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
    }
  }}>
    <Box sx={{ position: 'relative', height: 160 }}>
      <img
        src={article.image}
        alt={article.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }}
        loading="lazy"
      />
    </Box>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        {article.category_name}
      </Typography>
      <Typography variant="h6" component="h3" sx={{ 
        fontWeight: 'bold',
        mb: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {article.title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {new Date(article.created_at).toLocaleDateString()}
      </Typography>
    </CardContent>
    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
      <Button
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={() => handleArticleOpen(article)}
        sx={{ textTransform: 'none', color: '#0c5b3a', fontWeight: 'bold' }}
      >
        Read More
      </Button>
    </CardActions>
  </Card>
);

const HealthTips = () => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [openArticle, setOpenArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(data.results || data);
    } catch (err) {
      console.error('Error loading categories:', err);
      showNotification('Failed to load categories', 'error');
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      let articles = [];
      let totalCount = 0;

      if (selectedCategories.length === 0) {
        const response = await fetch(`${API_URL}/articles?page=${currentPage}`);
        const data = await response.json();
        articles = data.results || data;
        totalCount = data.count || data.length || 0;
      } else {
        const responses = await Promise.all(
          selectedCategories.map(cat => 
            fetch(`${API_URL}/articles?categories=${cat}`)
              .then(res => res.json())
              .catch(err => {
                console.error(`Error loading category ${cat}:`, err);
                return { results: [], count: 0 };
              })
          )
        );
        
        const articlesMap = new Map();
        responses.flatMap(res => res.results || res).forEach(article => {
          if (!articlesMap.has(article.id)) {
            articlesMap.set(article.id, article);
          }
        });
        
        articles = Array.from(articlesMap.values())
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        totalCount = articles.length;
        
        const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
        articles = articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
      }

      setArticles(articles);
      setTotalPages(Math.ceil(totalCount / ARTICLES_PER_PAGE) || 1);
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load articles');
      showNotification('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategories, currentPage]);

  const handleCategoryMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleCategoryMenuClose = () => setAnchorEl(null);
  
  const handleCategorySelect = (categorySlug) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug) 
        ? prev.filter(slug => slug !== categorySlug) 
        : [...prev, categorySlug]
    );
    setCurrentPage(1);
  };
  
  const handleClearCategories = () => {
    setSelectedCategories([]);
    setCurrentPage(1);
    handleCategoryMenuClose();
  };

  const handleArticleOpen = async (article) => {
    try {
      setOpenArticle(article);
      const response = await fetch(`${API_URL}/articles/${article.slug}/`);
      const fullArticle = await response.json();
      setOpenArticle(fullArticle);
    } catch (err) {
      console.error('Error loading article details:', err);
      showNotification('Failed to load full article content', 'error');
    }
  };
  
  const handleArticleClose = () => setOpenArticle(null);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryNames = () => {
    if (selectedCategories.length === 0) return 'All Categories';
    return selectedCategories.map(slug => 
      categories.find(cat => cat.slug === slug)?.name
    ).filter(Boolean).join(', ');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Health Tips
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your guide to a healthier lifestyle
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          endIcon={<KeyboardArrowDownIcon />}
          onClick={handleCategoryMenuOpen}
          sx={{ 
            borderRadius: 8, 
            backgroundColor: '#f5f5f5',
            color: '#000',
            textTransform: 'none',
            px: 2,
            whiteSpace: 'nowrap'
          }}
        >
          {getCategoryNames()}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCategoryMenuClose}
          sx={{ '& .MuiMenu-paper': { borderRadius: 2, maxHeight: 300, width: 250 } }}
        >
          <MenuItem onClick={handleClearCategories}>
            <Typography sx={{ fontWeight: selectedCategories.length === 0 ? 'bold' : 'normal' }}>
              All Categories
            </Typography>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem 
              key={category.id} 
              onClick={() => handleCategorySelect(category.slug)}
              sx={{ 
                backgroundColor: selectedCategories.includes(category.slug) ? '#f0f7ff' : 'transparent',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {selectedCategories.includes(category.slug) && (
                  <CheckIcon color="primary" sx={{ mr: 1 }} />
                )}
                <Typography sx={{ 
                  fontWeight: selectedCategories.includes(category.slug) ? 'bold' : 'normal',
                  flexGrow: 1
                }}>
                  {category.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {selectedCategories.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selectedCategories.map(slug => {
            const category = categories.find(cat => cat.slug === slug);
            return category && (
              <Chip
                key={slug}
                label={category.name}
                onDelete={() => handleCategorySelect(slug)}
                sx={{ backgroundColor: '#f0f7ff' }}
              />
            );
          })}
        </Box>
      )}


      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: ARTICLES_PER_PAGE }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
              <ArticleCardSkeleton />
            </Grid>
          ))
        ) : error ? (
          <Grid item xs={12}>
            <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
              {error}
            </Typography>
          </Grid>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <ArticleCard 
                article={article} 
                handleArticleOpen={handleArticleOpen}
              />
            </Grid>
          ))
        ) : (
          <Box sx={{ py: 3, width: '100%', textAlign: 'center' }}>
            <Typography>No articles found matching your criteria</Typography>
          </Box>
        )}
      </Grid>

      {totalPages > 1 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}


      <Dialog
        open={openArticle !== null}
        onClose={handleArticleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        {openArticle && (
          <>
            <DialogTitle sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee',
              py: 2,
              pr: 6
            }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {openArticle.title}
              </Typography>
              <IconButton 
                onClick={handleArticleClose}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: 12
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <img
                  src={openArticle.image}
                  alt={openArticle.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    borderRadius: 8,
                    margin: '24px auto',
                    display: 'block'
                  }}
                />
                <Box sx={{
                  maxWidth: '800px',
                  margin: '0 auto',
                  padding: '0 24px',
                  '& h1': {
                    fontSize: '2.2rem',
                    fontWeight: 'bold',
                    mb: 2,
                    lineHeight: 1.3,
                    borderBottom: '1px solid #eee',
                    paddingBottom: '0.5rem'
                  },
                  '& h2': {
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    mb: 1.5,
                    lineHeight: 1.3
                  },
                  '& h3': {
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mt: 2,
                    mb: 1,
                    lineHeight: 1.4
                  },
                  '& p': {
                    mb: 1.5,
                    lineHeight: 1.8,
                    fontSize: '1.1rem'
                  },
                  '& ul, & ol': {
                    mb: 2,
                    pl: 3,
                    '& li': {
                      mb: 1,
                      lineHeight: 1.8
                    }
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 1,
                    my: 3,
                    mx: 'auto',
                    display: 'block'
                  },
                  '@media (max-width: 600px)': {
                    padding: '0 16px',
                    '& p': {
                      fontSize: '1rem',
                      lineHeight: 1.7
                    }
                  }
                }}>
                  <ReactMarkdown>
                    {openArticle.content}
                  </ReactMarkdown>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HealthTips; 