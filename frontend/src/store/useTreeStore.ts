import { create } from "zustand"

interface CanvasState {
  x: number
  y: number
  scale: number
  setPan: (x: number, y: number) => void
  setZoom: (scale: number) => void
  reset: () => void
}

export const useTreeStore = create<CanvasState>((set) => ({
  x: 0,
  y: 0,
  scale: 1,
  setPan: (x, y) => set({ x, y }),
  setZoom: (scale) => set({ scale }),
  reset: () => set({ x: 0, y: 0, scale: 1 }),
}))
