// Portfolio packs are managed by Marketing (Portfolio view) but downloaded from
// CRM — two separate route trees with no shared parent below App. A tiny
// module-level store (via useSyncExternalStore) keeps them in sync without
// threading more props through App.jsx. Local state only, like everything else.
import { useSyncExternalStore } from 'react'
import { PORTFOLIO_PACKS } from './marketingData'

let packs = [...PORTFOLIO_PACKS]
const listeners = new Set()

const notify = () => listeners.forEach((fn) => fn())
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const getSnapshot = () => packs

export function usePortfolioPacks() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function addPortfolioPack({ category, fileName }) {
  const id = Math.max(0, ...packs.map((p) => p.id)) + 1
  packs = [...packs, { id, category, fileName, uploadedDate: new Date().toISOString().slice(0, 10) }]
  notify()
}

export function removePortfolioPack(id) {
  packs = packs.filter((p) => p.id !== id)
  notify()
}
