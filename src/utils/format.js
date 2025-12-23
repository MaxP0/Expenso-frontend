export function formatMoney(amount) {
  const value = Number(amount)
  const safe = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(safe)
}

export function formatDate(isoOrDate) {
  if (!isoOrDate) return ''
  const d = new Date(isoOrDate)
  return d.toLocaleDateString()
}
