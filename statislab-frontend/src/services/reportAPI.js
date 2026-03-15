import axios from "axios";
import { apiUrl, API_REQUEST_CONFIG } from "../config/api";

export const getReports = async (sessionId) => {
  const res = await axios.post(apiUrl("/get_report"), { sessionId }, API_REQUEST_CONFIG);
  const payload = res.data?.data || res.data;

  if (payload?.error) {
    throw new Error(payload.error);
  }

  return Array.isArray(payload) ? payload : [];
};


export const deleteReportItem = async (sessionId, index) => {
  const res = await axios.post(apiUrl("/report/delete"), { sessionId, index }, API_REQUEST_CONFIG);
  const payload = res.data?.data || res.data;

  if (payload?.error) {
    throw new Error(payload.error);
  }

  return Array.isArray(payload) ? payload : [];
};


export const reorderReportItem = async (sessionId, fromIndex, toIndex) => {
  const res = await axios.post(
    apiUrl("/report/reorder"),
    { sessionId, fromIndex, toIndex },
    API_REQUEST_CONFIG,
  );
  const payload = res.data?.data || res.data;

  if (payload?.error) {
    throw new Error(payload.error);
  }

  return Array.isArray(payload) ? payload : [];
};


export const resetReportItems = async (sessionId) => {
  const res = await axios.post(apiUrl("/report/reset"), { sessionId }, API_REQUEST_CONFIG);
  const payload = res.data?.data || res.data;

  if (payload?.error) {
    throw new Error(payload.error);
  }

  return Array.isArray(payload) ? payload : [];
};