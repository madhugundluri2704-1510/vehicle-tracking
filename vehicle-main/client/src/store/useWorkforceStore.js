import { create } from 'zustand';
import api from '../services/api';

const useWorkforceStore = create((set, get) => ({
  attendanceLogs: [],
  workforceStats: null,
  productivityStats: null,
  leaderboard: [],
  reportsData: [],
  aiPredictions: null,
  driverTimeline: [],
  loading: false,
  error: null,

  fetchTodayAttendance: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/attendance/today');
      set({ attendanceLogs: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  fetchWorkforceStats: async () => {
    try {
      const { data } = await api.get('/attendance/analytics');
      set({ workforceStats: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchProductivityStats: async () => {
    try {
      const { data } = await api.get('/performance/stats');
      set({ productivityStats: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchLeaderboard: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryStr = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&');
      const { data } = await api.get(`/performance/leaderboard?${queryStr}`);
      set({ leaderboard: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchReports: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryStr = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&');
      const { data } = await api.get(`/attendance/reports?${queryStr}`);
      set({ reportsData: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAIPredictions: async () => {
    try {
      const { data } = await api.get('/attendance/predictions');
      set({ aiPredictions: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchDriverTimeline: async (driverId, date) => {
    set({ loading: true, error: null });
    try {
      const url = `/attendance/timeline/${driverId}${date ? `?date=${date}` : ''}`;
      const { data } = await api.get(url);
      set({ driverTimeline: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  checkInDriver: async (checkInData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/attendance/check-in', checkInData);
      set({ loading: false });
      get().fetchTodayAttendance();
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  checkOutDriver: async (checkOutData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/attendance/check-out', checkOutData);
      set({ loading: false });
      get().fetchTodayAttendance();
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  toggleDriverBreak: async (breakData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/attendance/toggle-break', breakData);
      set({ loading: false });
      get().fetchTodayAttendance();
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  setWorkforceStats: (stats) => set({ workforceStats: stats }),
  clearError: () => set({ error: null })
}));

export default useWorkforceStore;
