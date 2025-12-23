import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth()
  const navigate = useNavigate()

  async function onLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Expenso
        </Link>

        {isAuthed ? (
          <nav className="flex items-center gap-2">
            {user?.role === 'employee' ? (
              <>
                <NavItem to="/reports">My Expense Reports</NavItem>
                <NavItem to="/reports/new">Create Expense Report</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/manager/reports">All Expense Reports</NavItem>
                <NavItem to="/manager/dashboard">Dashboard</NavItem>
              </>
            )}

            <button
              onClick={onLogout}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              type="button"
            >
              Logout
            </button>
          </nav>
        ) : (
          <div className="text-sm text-slate-600">Sign in</div>
        )}
      </div>
    </header>
  )
}
