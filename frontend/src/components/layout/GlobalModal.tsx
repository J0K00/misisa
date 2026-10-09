import { useModalStore } from '@/store/useModalStore'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export function GlobalModal() {
  const { isOpen, type, title, message, closeModal } = useModalStore()
  
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-12 h-12 text-green-500" />
      case 'error': return <XCircle className="w-12 h-12 text-red-500" />
      case 'warning': return <AlertTriangle className="w-12 h-12 text-amber-500" />
      case 'info': return <Info className="w-12 h-12 text-blue-500" />
      default: return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start p-4 border-b border-stone-100">
          <div className="w-6" /> {/* Spacer */}
          <div className="pt-4 flex flex-col items-center text-center">
            {getIcon()}
            <h2 className="mt-4 text-xl font-serif font-semibold text-stone-900">{title}</h2>
          </div>
          <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-center text-stone-600">
          <p>{message}</p>
        </div>
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-center">
          <button 
            onClick={closeModal}
            className="px-6 py-2 bg-[#3B2314] hover:bg-[#2A2421] text-white rounded-full font-medium transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  )
}
