import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  },
});

export const registerUser = (data) => axios.post(`${API}/auth/register`, data);
export const loginUser = (data) => axios.post(`${API}/auth/login`, data);
export const logoutUser = () => axios.post(`${API}/auth/logout`, {}, getHeaders());
export const getProfile = () => axios.get(`${API}/auth/profile`, getHeaders());
export const getAllUsers = () => axios.get(`${API}/auth/users`, getHeaders());
export const makeUserAdmin = (userId) => axios.put(`${API}/auth/users/${userId}/make-admin`, {}, getHeaders());
export const removeUserAdmin = (userId) => axios.put(`${API}/auth/users/${userId}/remove-admin`, {}, getHeaders());
export const deleteUser = (userId) => axios.delete(`${API}/auth/users/${userId}`, getHeaders());