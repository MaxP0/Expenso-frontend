import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
      <Link className="mt-6 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white" to="/">
        Go home
      </Link>
    </div>
  )
}
