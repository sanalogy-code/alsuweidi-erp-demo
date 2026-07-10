import { useState } from 'react'
import { AUDIT_LOG } from '../data/adminData'
import { nextId } from '../utils/id'

// ONE audit-log mechanism (code-quality item from BACKLOG.md): the canonical
// entry shape is Admin's — { id, ts: 'YYYY-MM-DD HH:mm', user, module, kind,
// detail } with kind from adminData's AUDIT_KINDS. Session actions from any
// module append here; the Admin Center's Activity log shows everything, and a
// module view (e.g. Finance → Activity) filters to its own module.
export function useAuditLog() {
  const [entries, setEntries] = useState(AUDIT_LOG)
  const record = ({ user, module, kind = 'update', detail }) => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const ts = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    setEntries((prev) => [{ id: nextId(prev), ts, user: user || 'System', module, kind, detail }, ...prev])
  }
  return { entries, record }
}
