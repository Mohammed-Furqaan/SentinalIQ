import { create } from 'zustand';
import api from '../api/axiosConfig';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, id, email, role } = response.data;
      const user = { id, username: response.data.username, email, role };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      let errorMessage = err.response?.data || 'Login failed. Please check credentials.';
      if (errorMessage === 'Bad credentials') {
        errorMessage = 'Invalid Credentials';
      }
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register', { username, email, password });
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data || 'Registration failed.', 
        isLoading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));
