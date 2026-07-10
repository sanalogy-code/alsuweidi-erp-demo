// Next numeric id for a seeded list — max existing id + 1, 1 for an empty list.
// Replaces the hand-rolled Math.max(0, ...list.map(x => x.id)) + 1 copies.
export function nextId(list) {
  return Math.max(0, ...list.map((x) => x.id)) + 1
}
