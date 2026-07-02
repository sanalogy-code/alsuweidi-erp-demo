import { useState, useMemo } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import Modal from './Modal'
import {
  RELATIONSHIP_TYPES, SUBTYPES_BY_RELATIONSHIP, SENIORITY_LEVELS, EMPLOYMENT_TYPES, daysSince,
} from '../../data/crmData'

const ALL_SUBTYPES = [...new Set(Object.values(SUBTYPES_BY_RELATIONSHIP).flat())]

const LAST_CONTACTED_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: 'last30', label: 'Contacted in last 30 days' },
  { value: 'last90', label: 'Contacted in last 90 days' },
  { value: 'never', label: 'Never contacted' },
]

function daysSinceNumber(date) {
  if (!date) return Infinity
  return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
}

function FilterGroup({ title, options, selected, onChange }) {
  const allSelected = options.every((o) => selected.has(o))
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
        <button
          onClick={() => onChange(allSelected ? new Set() : new Set(options))}
          className="text-[11px] text-brand font-medium hover:underline"
        >
          {allSelected ? 'Clear' : 'Select all'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.has(o)
          return (
            <button
              key={o}
              onClick={() => {
                const next = new Set(selected)
                active ? next.delete(o) : next.add(o)
                onChange(next)
              }}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${active ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ExportContactsModal({ contacts, companies, onClose }) {
  const [selCompanies, setSelCompanies] = useState(new Set(companies.map((c) => c.id)))
  const [selRelationships, setSelRelationships] = useState(new Set(RELATIONSHIP_TYPES))
  const [selSubTypes, setSelSubTypes] = useState(new Set(ALL_SUBTYPES))
  const [selSeniority, setSelSeniority] = useState(new Set(SENIORITY_LEVELS))
  const [selEmployment, setSelEmployment] = useState(new Set(EMPLOYMENT_TYPES))
  const [lastContacted, setLastContacted] = useState('any')

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (!selCompanies.has(c.companyId)) return false
      if (!selRelationships.has(c.relationship)) return false
      if (!selSubTypes.has(c.subType)) return false
      if (!selSeniority.has(c.seniority)) return false
      if (!selEmployment.has(c.employmentType)) return false
      const days = daysSinceNumber(c.lastContact)
      if (lastContacted === 'last30' && days > 30) return false
      if (lastContacted === 'last90' && days > 90) return false
      if (lastContacted === 'never' && c.lastContact) return false
      return true
    })
  }, [contacts, selCompanies, selRelationships, selSubTypes, selSeniority, selEmployment, lastContacted])

  function buildRows() {
    return filtered.map((c) => {
      const company = companies.find((co) => co.id === c.companyId)
      return {
        Name: c.name,
        Title: c.title,
        Company: company?.name || '',
        Email: c.email,
        Phone: c.phone,
        Relationship: c.relationship,
        'Sub-Type': c.subType,
        Seniority: c.seniority,
        'Employment Type': c.employmentType,
        'Last Contacted': c.lastContact || 'Never',
      }
    })
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(buildRows())
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts')
    XLSX.writeFile(wb, `alsuweidi-contacts-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  async function exportCsv() {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(buildRows())
    const csv = XLSX.utils.sheet_to_csv(ws)
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `alsuweidi-contacts-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <Modal wide title="Export Contacts" onClose={onClose}>
      <div className="space-y-5 mb-6">
        <FilterGroup title="Company" options={companies.map((c) => c.name)} selected={new Set([...selCompanies].map((id) => companies.find((c) => c.id === id)?.name))}
          onChange={(namesSet) => setSelCompanies(new Set(companies.filter((c) => namesSet.has(c.name)).map((c) => c.id)))} />
        <FilterGroup title="Relationship" options={RELATIONSHIP_TYPES} selected={selRelationships} onChange={setSelRelationships} />
        <FilterGroup title="Sub-Type" options={ALL_SUBTYPES} selected={selSubTypes} onChange={setSelSubTypes} />
        <FilterGroup title="Seniority" options={SENIORITY_LEVELS} selected={selSeniority} onChange={setSelSeniority} />
        <FilterGroup title="Employment Type" options={EMPLOYMENT_TYPES} selected={selEmployment} onChange={setSelEmployment} />

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Last Contacted</h4>
          <div className="flex flex-wrap gap-1.5">
            {LAST_CONTACTED_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setLastContacted(o.value)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${lastContacted === o.value ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-800">{filtered.length} contact{filtered.length !== 1 ? 's' : ''} match</span>
        </div>

        {filtered.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 max-h-40 overflow-y-auto">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {filtered.slice(0, 6).map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-medium text-gray-700">{c.name}</td>
                    <td className="px-3 py-2 text-gray-500">{companies.find((co) => co.id === c.companyId)?.name}</td>
                    <td className="px-3 py-2 text-gray-500">{c.email}</td>
                    <td className="px-3 py-2 text-gray-400">{daysSince(c.lastContact)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 6 && (
              <div className="text-center text-[11px] text-gray-400 py-1.5 bg-gray-50">+{filtered.length - 6} more</div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            disabled={filtered.length === 0}
            onClick={exportExcel}
            className="flex-1 bg-brand text-white py-2.5 rounded-md text-sm font-medium hover:bg-brand-dark disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={16} /> Export Excel (.xlsx)
          </button>
          <button
            disabled={filtered.length === 0}
            onClick={exportCsv}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Export CSV
          </button>
        </div>
      </div>
    </Modal>
  )
}
