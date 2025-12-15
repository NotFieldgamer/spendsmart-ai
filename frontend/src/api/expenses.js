import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/expenses`;

export const getExpenses = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createExpense = (token, data) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateExpense = (token, id, data) =>
  axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteExpense = (token, id) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
