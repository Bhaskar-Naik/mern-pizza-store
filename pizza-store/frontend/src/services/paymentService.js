import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  },
});

export const createPayment = (data) => axios.post(`${API}/payments`, data, getHeaders());
export const getPaymentByOrder = (orderId) => axios.get(`${API}/payments/${orderId}`, getHeaders());
export const generateBill = (orderId) => axios.get(`${API}/payments/bill/${orderId}`, getHeaders());
export const getActiveCoupons = () => axios.get(`${API}/coupons`, getHeaders());
export const validateCoupon = (data) => axios.post(`${API}/coupons/validate`, data, getHeaders());