// api.js (заглушка для будущего API)
export const api = {
    getTests: async (filters) => {
      console.log('Запрос к API с параметрами:', filters);
      
      // В будущем заменить на реальный запрос:
      // const response = await axios.get('/api/tests/', { params: filters });
      // return response.data;
      
      return Promise.resolve({ 
        results: [], 
        count: 0 
      });
    },
  
    getFilterOptions: async () => {
      return Promise.resolve({
        categories: [],
        laboratories: [],
        turnaroundOptions: [],
        max_price: 40000
      });
    }
  };