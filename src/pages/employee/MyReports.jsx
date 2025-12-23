import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { http } from '../../api/http.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { formatDate, formatMoney } from '../../utils/format.js'

export default function MyReports() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isManager = user?.role === 'manager'

  useEffect(() => {
    if (isManager) navigate('/manager/reports', { replace: true })
  }, [isManager, navigate])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get('/expense_reports')
      setReports(res.data.expense_reports)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isManager) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager])

  const hasReports = useMemo(() => reports.length > 0, [reports])

  async function onDelete(id) {
    if (!confirm('Delete this draft report?')) return
    await http.delete(`/expense_reports/${id}`)
    await load()
  }

  async function onSubmit(id) {
    await http.post(`/expense_reports/${id}/submit`)
    await load()
  }

  if (isManager) return null

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Expense Reports</h1>
          <p className="mt-1 text-sm text-slate-600">Create, edit drafts, and submit for approval.</p>
        </div>
        <Link
          to="/reports/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-sm text-slate-600">Loading…</div>
      ) : error ? (
        <div className="mt-6 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      ) : !hasReports ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="text-sm text-slate-700">No reports yet.</div>
          <Link className="mt-4 inline-block text-sm font-medium text-slate-900 underline" to="/reports/new">
            Create your first report
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full table-auto">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Attachments</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reports.map((r) => (
                <tr key={r.id} className="text-sm">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                  <td className="px-4 py-3 text-slate-700">{r.category}</td>
                  <td className="px-4 py-3 text-slate-700">{formatMoney(r.amount)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(r.date)}</td>
                  <td className="px-4 py-3">
                    {r.receipt_url ? (
                      <a
                        className="text-sm font-medium text-slate-700 underline"
                        href={r.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Receipt
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Empty
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      {r.status === 'draft' ? (
                        <>
                          <Link
                            to={`/reports/${r.id}/edit`}
                            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => onSubmit(r.id)}
                            className="inline-flex items-center rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2"
                            type="button"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2"
                            type="button"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Not available
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
