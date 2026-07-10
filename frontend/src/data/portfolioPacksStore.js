// Portfolio packs are managed by Marketing (Portfolio view) but downloaded from
// CRM — two separate route trees with no shared parent below App. A tiny
// module-level store (via useSyncExternalStore) keeps them in sync without
// threading more props through App.jsx. Local state only, like everything else.
import { useSyncExternalStore } from 'react'
import { PORTFOLIO_PACKS } from './marketingData'
import { todayISO } from '../utils/date'
import { nextId } from '../utils/id'

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
  const id = nextId(packs)
  packs = [...packs, { id, category, fileName, uploadedDate: todayISO() }]
  notify()
}

export function removePortfolioPack(id) {
  packs = packs.filter((p) => p.id !== id)
  notify()
}
