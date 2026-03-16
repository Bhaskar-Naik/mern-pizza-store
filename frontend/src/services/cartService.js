import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  },
});

export const getCart = () => axios.get(`${API}/cart`, getHeaders());
export const addToCart = (data) => axios.post(`${API}/cart`, data, getHeaders());
export const updateCartItem = (itemId, data) => axios.put(`${API}/cart/${itemId}`, data, getHeaders());
export const removeFromCart = (itemId) => axios.delete(`${API}/cart/${itemId}`, getHeaders());
export const clearCart = () => axios.delete(`${API}/cart`, getHeaders());