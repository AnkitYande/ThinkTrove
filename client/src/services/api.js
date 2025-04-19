import axios from 'axios';

// Get base API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 second timeout
});

// Error handler helper
const handleApiError = (error, customMessage) => {
  // Extract the most useful error message
  let errorMessage = customMessage || 'An unexpected error occurred';
  
  if (error.response) {
    // The server responded with a status code outside the 2xx range
    const serverError = error.response.data?.error || error.response.statusText;
    errorMessage = `Server error: ${serverError}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request
    errorMessage = error.message || errorMessage;
  }
  
  console.error(customMessage, error);
  throw new Error(errorMessage);
};

// Configuration endpoints
export const getConfigurations = async () => {
  const response = await api.get('/config');
  return response.data;
};

export const getConfigurationById = async (id) => {
  if (!id) {
    throw new Error('Configuration ID is required');
  }
  
  try {
    const response = await api.get(`/config/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, `Error fetching configuration ${id}`);
  }
};

export const saveConfiguration = async (config) => {
  const response = await api.post('/config', config);
  return response.data;
};

export const updateConfiguration = async (id, config) => {
  const response = await api.put(`/config/${id}`, config);
  return response.data;
};

export const deleteConfiguration = async (id) => {
  const response = await api.delete(`/config/${id}`);
  return response.data;
};

// Chat endpoint
export const sendChatMessage = async (configId, messages) => {
  const response = await api.post('/chat', { configId, messages });
  return response.data;
};

export default api; 