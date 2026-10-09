import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  setAuth: (user: User | null, token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setAuth: (user, token) => set({ isAuthenticated: !!user, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
)
