const styles = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function StatusBadge({ status }) {
  const cls = styles[status] || 'bg-slate-100 text-slate-700 ring-slate-200'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {status}
    </span>
  )
}
