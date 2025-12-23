import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import MyReports from './pages/employee/MyReports.jsx'
import ReportForm from './pages/employee/ReportForm.jsx'
import AllReports from './pages/manager/AllReports.jsx'
import Dashboard from './pages/manager/Dashboard.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}
          >
            <Route path="/" element={<Navigate to="/reports" replace />} />

            <Route path="/reports" element={<MyReports />} />
            <Route path="/reports/new" element={<ReportForm mode="create" />} />
            <Route path="/reports/:id/edit" element={<ReportForm mode="edit" />} />

            <Route path="/manager/reports" element={<AllReports />} />
            <Route path="/manager/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
