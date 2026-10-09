import { create } from 'zustand'

type ModalType = 'success' | 'error' | 'warning' | 'info' | null;

interface ModalState {
  type: ModalType;
  title: string;
  message: string;
  isOpen: boolean;
  showModal: (type: ModalType, title: string, message: string) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  title: "",
  message: "",
  isOpen: false,
  showModal: (type, title, message) => set({ type, title, message, isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))
