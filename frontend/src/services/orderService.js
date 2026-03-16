import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  },
});

export const placeOrder = (data) => axios.post(`${API}/orders`, data, getHeaders());
export const getOrders = () => axios.get(`${API}/orders`, getHeaders());
export const getOrderById = (id) => axios.get(`${API}/orders/${id}`, getHeaders());
export const cancelOrder = (id) => axios.put(`${API}/orders/${id}/cancel`, {}, getHeaders());
export const updateOrderStatus = (id, data) => axios.put(`${API}/orders/${id}/status`, data, getHeaders());
export const getMonthlyRevenue = () => axios.get(`${API}/orders/revenue/monthly`, getHeaders());
export const getAddresses = () => axios.get(`${API}/addresses`, getHeaders());
export const addAddress = (data) => axios.post(`${API}/addresses`, data, getHeaders());
export const deleteOrder = (id) => axios.delete(`${API}/orders/${id}`, getHeaders());