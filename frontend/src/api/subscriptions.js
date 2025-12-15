import axios from "axios";

const API = "http://localhost:5000/api/subscriptions";

export const getSubscriptions = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addSubscription = (token, data) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateSubscription = (token, id, data) =>
  axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteSubscription = (token, id) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const scanSubscriptions = (token) =>
  axios.get(`${API}/detect/scan`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getSubscriptionAlerts = (token) =>
  axios.get("http://localhost:5000/api/subscriptions/alerts/renewals", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllAlerts = (token) =>
  axios.get("http://localhost:5000/api/subscriptions/alerts/renewals", {
    headers: { Authorization: `Bearer ${token}` },
  });