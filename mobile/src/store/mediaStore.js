import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:5000/api';

export const useMediaStore = create((set, get) => ({
  media: [],
  purchasedMedia: [],
  isLoading: false,
  error: null,

  fetchDiscoverFeed: async (page = 1, sort = 'recent') => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(
        `${API_URL}/feed/discover?page=${page}&limit=20&sort=${sort}`,
        { headers },
      );

      if (!response.ok) throw new Error('Failed to fetch feed');

      const data = await response.json();
      set({ media: data.data });
      return data;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrendingMedia: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(
        `${API_URL}/feed/trending?limit=${limit}`,
        { headers },
      );

      if (!response.ok) throw new Error('Failed to fetch trending');

      const data = await response.json();
      return data.data;
    } catch (error) {
      set({ error: error.message });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMediaDetails: async (mediaId) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(`${API_URL}/media/${mediaId}`, { headers });

      if (!response.ok) throw new Error('Failed to fetch media');

      const data = await response.json();
      return data;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  searchMedia: async (query, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(
        `${API_URL}/media/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`,
        { headers },
      );

      if (!response.ok) throw new Error('Failed to search');

      const data = await response.json();
      set({ media: data.data });
      return data;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseMedia: async (mediaId) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(`${API_URL}/purchases/buy`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  getDownloadUrl: async (mediaId) => {
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(
        `${API_URL}/purchases/download/${mediaId}`,
        { headers },
      );

      if (!response.ok) throw new Error('Failed to get download URL');

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  },

  likeMedia: async (mediaId) => {
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(`${API_URL}/media/${mediaId}/like`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) throw new Error('Failed to like media');

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  },

  fetchPurchasedMedia: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(
        `${API_URL}/purchases/purchased?page=${page}&limit=20`,
        { headers },
      );

      if (!response.ok) throw new Error('Failed to fetch purchased media');

      const data = await response.json();
      set({ purchasedMedia: data.data });
      return data;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useMediaStore;
