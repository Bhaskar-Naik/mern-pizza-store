import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  },
});

export const getMenuItems = () => axios.get(`${API}/menu`);
export const getCategories = () => axios.get(`${API}/categories`);
export const createMenuItem = (data) => axios.post(`${API}/menu`, data, getHeaders());
export const updateMenuItem = (id, data) => axios.put(`${API}/menu/${id}`, data, getHeaders());
export const deleteMenuItem = (id) => axios.delete(`${API}/menu/${id}`, getHeaders());
export const createCategory = (data) => axios.post(`${API}/categories`, data, getHeaders());