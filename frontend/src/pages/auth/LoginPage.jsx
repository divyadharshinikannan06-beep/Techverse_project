import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthBrandPanel from '../../components/AuthBrandPanel'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await login(form)
      navigate('/placement', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Authentication seal rejected. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <div className="auth-layout">
        <AuthBrandPanel />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="auth-card crystal-panel"
        >
          <div className="auth-brand">
            <div className="kingdom-brand-mark">
              <span className="brand-orbital-ring" />
              <span className="brand-tv-monogram">TV</span>
              <Sparkles size={11} className="brand-diamond-sparkle" />
            </div>
            <div>
              <p className="crystal-eyebrow">
                <span className="spark">✦</span> TECHVERSE
              </p>
              <h2>ENTER THE CRYSTAL CITADEL</h2>
            </div>
          </div>

          <p className="auth-intro">
            Attune your adventurer cipher to re-enter the realms and continue your journey.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field-group">
              <span>Adventurer Email</span>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="adventurer@techverse.realm"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <div className="field-label-row">
                <span>Secret Cipher (Password)</span>
                <button
                  type="button"
                  className="forgot-link-btn"
                  onClick={() => toast('Password renewal scroll will open on request.')}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-with-icon">
                <LockKeyhole size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="crystal-btn crystal-btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>Attuning Ley-lines…</>
              ) : (
                <>
                  <Sparkles size={16} /> ENTER TECHVERSE
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>New to the Crystal Kingdom?</span>
            <Link to="/register" className="auth-link-accent">
              Create Account <ArrowRight size={13} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
