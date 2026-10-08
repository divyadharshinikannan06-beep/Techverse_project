import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { parseJsonResponse } from '../utils/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'techverse-auth-token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const saveSession = (data) => {
    if (!data.token || !data.user) {
      throw new Error('Authentication response was incomplete')
    }

    localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
  }

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    const fetchCurrentUser = async () => {
      try {
        let response
        try {
          response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        } catch {
          // If server is temporarily unreachable, do not clear token immediately
          setLoading(false)
          return
        }

        const data = await parseJsonResponse(response)

        if (!response.ok) {
          throw new Error(data?.message || 'Session expired')
        }

        if (data?.user) {
          setUser(data.user)
        } else {
          throw new Error('User profile data missing')
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY)
        setToken('')
        setUser(null)
        console.error('Auth restore failed:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [token])

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [token])

  const login = async ({ email, password }) => {
    let response
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
    } catch {
      throw new Error('Unable to connect to the TechVerse server. Please ensure the backend is running.')
    }

    const data = await parseJsonResponse(response)

    if (!response.ok) {
      const message =
        data?.message ||
        (response.status === 502 || response.status === 503
          ? 'TechVerse service is temporarily unavailable. Please try again shortly.'
          : 'Login failed. Please check your credentials.')
      throw new Error(message)
    }

    if (!data || !data.token || !data.user) {
      throw new Error('Authentication response was incomplete')
    }

    saveSession(data)
    toast.success('Welcome back to TechVerse')
    return data
  }

  const register = async ({ name, email, password, confirmPassword }) => {
    let response
    try {
      response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })
    } catch {
      throw new Error('Unable to connect to the TechVerse server. Please ensure the backend is running.')
    }

    const data = await parseJsonResponse(response)

    if (!response.ok) {
      const message =
        data?.message ||
        (response.status === 502 || response.status === 503
          ? 'TechVerse service is temporarily unavailable. Please try again shortly.'
          : 'Registration failed. Please check your details.')
      throw new Error(message)
    }

    if (!data || !data.token || !data.user) {
      throw new Error('Authentication response was incomplete')
    }

    saveSession(data)
    toast.success('Account created successfully')
    return data
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      setToken('')
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
      toast.success('Logged out successfully')
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      markPlacementCompleted: () => setUser((current) => current ? { ...current, placementCompleted: true } : current),
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
