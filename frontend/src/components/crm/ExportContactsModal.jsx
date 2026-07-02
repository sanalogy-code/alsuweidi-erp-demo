import { useState, useMemo, useRef, useEffect } from 'react'
import { FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'
import Modal from './Modal'
import {
  RELATIONSHIP_TYPES, SUBTYPES_BY_RELATIONSHIP, SENIORITY_LEVELS, EMPLOYMENT_TYPES, daysSince,
} from '../../data/crmData'

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

function MultiSelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const allSelected = options.length > 0 && options.every((o) => selected.has(o))
  const summary =
    options.length === 0 ? 'No options'
    : allSelected ? 'All'
    : selected.size === 0 ? 'None selected'
    : `${selected.size} of ${options.length} selected`

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={options.length === 0}
        className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-gray-50 disabled:text-gray-400"
      >
        <span className={selected.size === 0 ? 'text-gray-400' : 'text-gray-700'}>{summary}</span>
        <ChevronDown size={14} className={`text-gray-400 transition shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
          <button
            type="button"
            onClick={() => onChange(allSelected ? new Set() : new Set(options))}
            className="w-full text-left px-3 py-2 text-xs font-medium text-brand hover:bg-gray-50 border-b border-gray-100 sticky top-0 bg-white"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(o)}
                onChange={() => {
                  const next = new Set(selected)
                  selected.has(o) ? next.delete(o) : next.add(o)
                  onChange(next)
                }}
                className="w-4 h-4 accent-current text-brand rounded"
              />
              <span className="text-gray-700">{o}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExportContactsModal({ contacts, companies, onClose }) {
  const [selCompanies, setSelCompanies] = useState(new Set(companies.map((c) => c.id)))
  const [selRelationships, setSelRelationships] = useState(new Set(RELATIONSHIP_TYPES))
  const [selSubTypes, setSelSubTypes] = useState(
    new Set(RELATIONSHIP_TYPES.flatMap((r) => SUBTYPES_BY_RELATIONSHIP[r] || []))
  )
  const [selSeniority, setSelSeniority] = useState(new Set(SENIORITY_LEVELS))
  const [selEmployment, setSelEmployment] = useState(new Set(EMPLOYMENT_TYPES))
  const [lastContacted, setLastContacted] = useState('any')

  // Sub-type options are scoped to whichever relationships are currently selected.
  const availableSubTypes = useMemo(
    () => [...new Set([...selRelationships].flatMap((r) => SUBTYPES_BY_RELATIONSHIP[r] || []))],
    [selRelationships]
  )

  function handleRelationshipChange(nextRelationships) {
    setSelRelationships(nextRelationships)
    const nextSubTypes = [...new Set([...nextRelationships].flatMap((r) => SUBTYPES_BY_RELATIONSHIP[r] || []))]
    setSelSubTypes(new Set(nextSubTypes))
  }

  const companyOptions = companies.map((c) => c.name)
  const selCompanyNames = new Set([...selCompanies].map((id) => companies.find((c) => c.id === id)?.name))

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <MultiSelectDropdown
          label="Company"
          options={companyOptions}
          selected={selCompanyNames}
          onChange={(namesSet) => setSelCompanies(new Set(companies.filter((c) => namesSet.has(c.name)).map((c) => c.id)))}
        />
        <MultiSelectDropdown label="Relationship" options={RELATIONSHIP_TYPES} selected={selRelationships} onChange={handleRelationshipChange} />
        <MultiSelectDropdown label="Sub-Type" options={availableSubTypes} selected={selSubTypes} onChange={setSelSubTypes} />
        <MultiSelectDropdown label="Seniority" options={SENIORITY_LEVELS} selected={selSeniority} onChange={setSelSeniority} />
        <MultiSelectDropdown label="Employment Type" options={EMPLOYMENT_TYPES} selected={selEmployment} onChange={setSelEmployment} />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Last Contacted</label>
          <select
            value={lastContacted}
            onChange={(e) => setLastContacted(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {LAST_CONTACTED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
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
