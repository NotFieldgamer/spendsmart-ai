import axios from "axios";

const API = "http://localhost:5000/api/budgets";

export const getBudgets = (token, month) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
    params: month ? { month } : {},
  });

export const createBudget = (token, data) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateBudget = (token, id, data) =>
  axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteBudget = (token, id) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
