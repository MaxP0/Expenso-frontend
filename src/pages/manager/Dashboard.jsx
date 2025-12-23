import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { http } from '../../api/http.js'
import RequireManager from '../../components/RequireManager.jsx'
import { formatMoney } from '../../utils/format.js'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const expensesByCategory = Array.isArray(data?.expenses_by_category) ? data.expenses_by_category : []
  const categoryTotal = expensesByCategory.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0)
  const topCategoryIndex = expensesByCategory.reduce((bestIndex, item, idx) => {
    const bestAmount = Number(expensesByCategory?.[bestIndex]?.amount) || 0
    const amount = Number(item?.amount) || 0
    return amount > bestAmount ? idx : bestIndex
  }, 0)
  const topCategory = expensesByCategory[topCategoryIndex]
  const topCategoryPercent = categoryTotal > 0 ? Math.round(((Number(topCategory?.amount) || 0) / categoryTotal) * 100) : 0

  function renderActiveSlice(props) {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-slate-900">
          {payload?.category}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="central" className="fill-slate-600 text-sm">
          {formatMoney(value)}
        </text>
      </g>
    )
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await http.get('/dashboard')
        if (!cancelled) setData(res.data)
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <RequireManager>
      <div>
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Analytics across all expense reports.</p>
        </div>

        {loading ? (
          <div className="py-8 text-sm text-slate-600">Loading…</div>
        ) : error ? (
          <div className="mt-6 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-sm text-slate-600">Total expenses</div>
                <div className="mt-1 text-2xl font-semibold">{formatMoney(data.total_expenses)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-sm text-slate-600">Submitted reports</div>
                <div className="mt-1 text-2xl font-semibold">{data.submitted_count}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">Expenses by category</div>
                {topCategory ? (
                  <div className="mt-1 text-sm text-slate-600">
                    Most popular: <span className="font-medium text-slate-900">{topCategory.category}</span> ({topCategoryPercent}%)
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-slate-600">No category data yet.</div>
                )}
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value) => formatMoney(Number(value) || 0)} />
                      <Legend />
                      <Pie
                        data={expensesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={82}
                        paddingAngle={2}
                        activeIndex={expensesByCategory.length > 0 ? topCategoryIndex : -1}
                        activeShape={renderActiveSlice}
                      >
                        {expensesByCategory.map((_, idx) => {
                          const fillOpacity = 0.25 + (idx % 6) * 0.12
                          return <Cell key={idx} fill="#0f172a" fillOpacity={Math.min(fillOpacity, 0.95)} />
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">Expenses by month</div>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.expenses_by_month} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" name="Amount" stroke="#0f172a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RequireManager>
  )
}
