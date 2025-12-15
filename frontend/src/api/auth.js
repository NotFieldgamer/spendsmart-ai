import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const registerUser = (data) =>
  axios.post(`${API}/register`, data);

export const loginUser = (data) =>
  axios.post(`${API}/login`, data);

export const verifyToken = (token) =>
  axios.get(`${API}/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
