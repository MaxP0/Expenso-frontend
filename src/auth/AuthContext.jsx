import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { http, setAuthToken } from '../api/http.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'expenso_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        if (!token) {
          if (!cancelled) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        const res = await http.get('/auth/me')
        if (!cancelled) setUser(res.data.user)
      } catch {
        if (!cancelled) {
          setUser(null)
          setToken(null)
          localStorage.removeItem(TOKEN_KEY)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [token])

  async function login(email, password) {
    const res = await http.post('/auth/login', { email, password })
    const nextToken = res.data.token
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setUser(res.data.user)
  }

  async function logout() {
    try {
      await http.delete('/auth/logout')
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    }
  }

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthed: Boolean(token && user),
    login,
    logout,
  }), [token, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
