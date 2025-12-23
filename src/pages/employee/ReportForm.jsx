import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { http } from '../../api/http.js'
import { formatDate, formatMoney } from '../../utils/format.js'

const CATEGORIES = [
  'Fuel',
  'Meals',
  'Office Supplies',
  'Software',
  'Other',
]

export default function ReportForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(mode === 'edit')
  const [error, setError] = useState(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [status, setStatus] = useState('draft')

  const isEdit = mode === 'edit'

  const canEdit = useMemo(() => !isEdit || status === 'draft', [isEdit, status])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await http.get(`/expense_reports/${id}`)
        const r = res.data.expense_report

        if (cancelled) return
        setTitle(r.title || '')
        setCategory(r.category || CATEGORIES[0])
        setAmount(r.amount ?? '')
        setDate(r.date || '')
        setDescription(r.description || '')
        setStatus(r.status || 'draft')
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || 'Failed to load report')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (isEdit) load()

    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    const form = new FormData()
    form.append('expense_report[title]', title)
    form.append('expense_report[category]', category)
    form.append('expense_report[amount]', amount)
    form.append('expense_report[date]', date)
    form.append('expense_report[description]', description)
    if (receipt) form.append('expense_report[receipt]', receipt)

    try {
      if (isEdit) {
        await http.patch(`/expense_reports/${id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await http.post('/expense_reports', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      navigate('/reports', { replace: true })
    } catch (err) {
      const errors = err?.response?.data?.errors
      setError(Array.isArray(errors) ? errors.join(', ') : (err?.response?.data?.error || 'Save failed'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{isEdit ? 'Edit Expense Report' : 'Create Expense Report'}</h1>
          <p className="mt-1 text-sm text-slate-600">Fields: title, category, amount, date, description, receipt.</p>
        </div>
        <Link className="text-sm font-medium text-slate-900 underline" to="/reports">Back</Link>
      </div>

      {loading ? (
        <div className="py-8 text-sm text-slate-600">Loading…</div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          {!canEdit ? (
            <div className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This report is <span className="font-medium">{status}</span> and can’t be edited.
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          ) : null}

          <form className="grid grid-cols-1 gap-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={!canEdit}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!canEdit}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Amount</label>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Receipt upload</label>
              <input
                className="mt-1 block w-full text-sm"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                disabled={!canEdit}
              />
              <p className="mt-1 text-xs text-slate-500">Optional. You can attach an image or PDF.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                type="submit"
                disabled={!canEdit}
              >
                {isEdit ? 'Save changes' : 'Create report'}
              </button>
            </div>
          </form>

          {isEdit ? (
            <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-medium">Current values</div>
              <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
                <div><span className="text-slate-500">Status:</span> {status}</div>
                <div><span className="text-slate-500">Amount:</span> {formatMoney(amount)}</div>
                <div><span className="text-slate-500">Date:</span> {formatDate(date)}</div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
