import axios from "axios";

const API = "http://localhost:5000/api/ai";

export const fetchInsights = (token) =>
  axios.get(`${API}/insights`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchBudgetAdvice = (token) =>
  axios.get(`${API}/budget-advice`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchSubscriptionAdvice = (token) =>
  axios.get("http://localhost:5000/api/ai/subscriptions-cancellation", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchExpenseEnrichment = (token) =>
  axios.get(`${API}/expenses-enriched`,{
    headers: {Authorization: `Bearer ${token}`},
  });
