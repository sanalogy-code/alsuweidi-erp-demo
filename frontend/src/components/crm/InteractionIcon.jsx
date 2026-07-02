import { Phone, Mail, Users, StickyNote } from 'lucide-react'

const ICONS = { Call: Phone, Email: Mail, Meeting: Users, Note: StickyNote }
const COLORS = {
  Call: 'bg-blue-100 text-blue-600',
  Email: 'bg-purple-100 text-purple-600',
  Meeting: 'bg-green-100 text-green-600',
  Note: 'bg-gray-100 text-gray-600',
}

export default function InteractionIcon({ type, size = 14 }) {
  const Icon = ICONS[type] || StickyNote
  return (
    <span className={`inline-flex items-center justify-center rounded-full p-1.5 ${COLORS[type] || COLORS.Note}`}>
      <Icon size={size} />
    </span>
  )
}
