import { create } from "zustand";
import { AxiosError } from "axios";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { initializeSocket, disconnectSocket } from "../socket/socket.client";

type User = {
  username: string;
  password: string;
};

interface AuthStore {
  authUser: User | null;
  checkingAuth: boolean;
  loading: boolean;
  checkAuth: () => Promise<void>;
  signup: (user: User) => Promise<void>;
  login: (loginUser: User) => Promise<void>;
  logout: () => Promise<void>;
  setAuthUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  authUser: null,
  checkingAuth: true,
  loading: false,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ authUser: res.data.user });
      initializeSocket(res.data.user.id);
    } catch (error) {
      set({ authUser: null });
      console.log(error);
    } finally {
      set({ checkingAuth: false });
    }
  },

  signup: async (user: User) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/auth/signup", user);
      set({ authUser: res.data.user });
      initializeSocket(res.data.user.id);
      toast.success("Sign up successful! Welcome aboard!");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ loading: false });
    }
  },

  login: async (loginUser: User) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/auth/login", loginUser);
      set({ authUser: res.data.user });
      initializeSocket(res.data.user.id);
      toast.success("Login successful! Welcome back!");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      disconnectSocket();
      if (res.status === 200) {
        set({ authUser: null });
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  },

  setAuthUser: (user: User | null) => {
    set({ authUser: user });
  },
}));
