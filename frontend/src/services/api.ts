import axios from "axios"
import { useAuthStore } from "../store/useAuthStore"
import { useModalStore } from "../store/useModalStore"

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
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
  (response) => response,
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
