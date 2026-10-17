import axios from "axios"
import { useAuthStore } from "../store/useAuthStore"
import { useModalStore } from "../store/useModalStore"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8000" : ""),
  headers: {
    "Content-Type": "application/json",
  }
})

api.interceptors.request.use((config) => {
  const tokenData = localStorage.getItem('auth-storage')
  if (tokenData) {
    try {
      const parsed = JSON.parse(tokenData)
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {}
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const newToken = response.headers?.['x-new-token'] || response.headers?.['X-New-Token']
    const newRole = response.headers?.['x-new-role'] || response.headers?.['X-New-Role']
    if (newToken && newRole) {
      const currentAuth = useAuthStore.getState()
      if (currentAuth.user) {
        currentAuth.setAuth(
          { ...currentAuth.user, role: newRole },
          newToken
        )
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      useModalStore.getState().showModal(
        'error', 
        'Non autorisé', 
        'Votre session a expiré ou est invalide. Veuillez vous reconnecter.'
      )
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      const msg = error.response?.data?.message || error.response?.data?.detail || "Vous n'avez pas la permission d'effectuer cette action."
      useModalStore.getState().showModal('error', 'Accès refusé', msg)
    }
    return Promise.reject(error)
  }
)

export async function downgradeGuestToViewer() {
  try {
    const { data } = await api.post("/auth/guest-downgrade")
    if (data?.access_token) {
      const currentAuth = useAuthStore.getState()
      if (currentAuth.user) {
        currentAuth.setAuth({ ...currentAuth.user, role: "VIEWER" }, data.access_token)
      }
    }
  } catch (e) {
    console.error("Failed to downgrade guest session", e)
  }
}
