import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:5000/api';

export const useWalletStore = create((set, get) => ({
  balance: 0,
  transactions: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(`${API_URL}/wallet/balance`, { headers });

      if (!response.ok) throw new Error('Failed to fetch balance');

      const data = await response.json();
      set({ balance: data.balance });
      return data.balance;
    } catch (error) {
      set({ error: error.message });
      return 0;
    }
  },

  fetchTransactions: async (page = 1, type = null) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      let url = `${API_URL}/wallet/transactions?page=${page}&limit=20`;
      if (type) url += `&type=${type}`;

      const response = await fetch(url, { headers });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      set({ transactions: data.data });
      return data;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(`${API_URL}/wallet/stats`, { headers });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      set({ stats: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },

  addFunds: async (amount, paymentMethod) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(`${API_URL}/wallet/deposit`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deposit failed');
      }

      const data = await response.json();
      set({ balance: data.newBalance });
      await get().fetchTransactions();

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  withdrawFunds: async (amount, paymentMethod) => {
    set({ isLoading: true, error: null });
    try {
      const headers = useAuthStore.getState().getAuthHeader();
      const response = await fetch(`${API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdrawal failed');
      }

      const data = await response.json();
      set({ balance: data.newBalance });
      await get().fetchTransactions();

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateBalance: (newBalance) => {
    set({ balance: newBalance });
  },
}));

export default useWalletStore;
