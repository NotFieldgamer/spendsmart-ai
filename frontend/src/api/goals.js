import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/goals`;

export const getGoals = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createGoal = (token, data) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateGoal = (token, id, data) =>
  axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteGoal = (token, id) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
