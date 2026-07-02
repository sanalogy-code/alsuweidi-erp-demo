import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, wide, layered }) {
  return (
    <div className={`fixed inset-0 bg-black/40 flex items-center justify-center p-4 ${layered ? 'z-[60]' : 'z-50'}`}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
