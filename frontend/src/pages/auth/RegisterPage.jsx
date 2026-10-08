import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LockKeyhole, Mail, Shield, Sparkles, UserRound, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthBrandPanel from '../../components/AuthBrandPanel'

const passwordChecks = [
  { label: 'At least 6 runes', test: (value) => value.length >= 6 },
  { label: 'Contains a number', test: (value) => /\d/.test(value) },
  { label: 'Contains a letter', test: (value) => /[a-zA-Z]/.test(value) },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordScore = passwordChecks.filter(({ test }) => test(form.password)).length

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register(form)
      navigate('/placement', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Identity initialization failed')
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
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="auth-card register-card crystal-panel"
        >
          <div className="auth-brand">
            <div className="kingdom-brand-mark">
              <span className="brand-orbital-ring" />
              <span className="brand-tv-monogram">TV</span>
              <Sparkles size={11} className="brand-diamond-sparkle" />
            </div>
            <div>
              <p className="crystal-eyebrow">
                <span className="spark">✦</span> JOIN TECHVERSE
              </p>
              <h2>CREATE YOUR TECHVERSE IDENTITY</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field-group">
              <span>Adventurer Name</span>
              <div className="input-with-icon">
                <UserRound size={16} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Robin Archmage"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Email Conduit</span>
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
              <span>Secret Cipher (Password)</span>
              <div className="input-with-icon">
                <LockKeyhole size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Forge secret cipher"
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

            <div className="password-meter" aria-live="polite">
              <div className="meter-bar">
                <span
                  style={{
                    width: `${(passwordScore / passwordChecks.length) * 100}%`,
                    background:
                      passwordScore === 3
                        ? 'var(--tv-emerald)'
                        : passwordScore === 2
                        ? 'var(--tv-gold)'
                        : 'var(--tv-pink)',
                  }}
                />
              </div>
              <div className="meter-labels">
                {passwordChecks.map(({ label, test }) => (
                  <small key={label} className={test(form.password) ? 'pass' : ''}>
                    {label}
                  </small>
                ))}
              </div>
            </div>

            <label className="field-group">
              <span>Confirm Secret Cipher</span>
              <div className="input-with-icon">
                <Shield size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat cipher to verify"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="crystal-btn crystal-btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>Forging Identity…</>
              ) : (
                <>
                  <Sparkles size={16} /> BEGIN YOUR JOURNEY
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have a TechVerse identity?</span>
            <Link to="/login" className="auth-link-accent">
              Enter Citadel <ArrowRight size={13} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
