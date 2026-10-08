import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCircle2,
  Crown,
  Eye,
  Flame,
  Globe2,
  Lock,
  Moon,
  Palette,
  Save,
  Shield,
  Sliders,
  Sparkles,
  User,
  Zap,
  Camera,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: user?.name || 'Explorer Apprentice',
    email: user?.email || 'explorer@techverse.realm',
    realmTitle: 'Archmage Apprentice of Code',
    avatarUrl: user?.avatarUrl || '',
  })

  const [appearance, setAppearance] = useState({
    theme: 'cosmic-citadel',
    glowIntensity: 'vibrant',
    particlesEnabled: true,
    fontFamily: 'space-grotesk',
  })

  const [notifications, setNotifications] = useState({
    dailyQuestAlerts: true,
    streakReminders: true,
    chronicleDispatches: true,
    soundEffects: false,
  })

  const [learningPrefs, setLearningPrefs] = useState({
    primaryRealm: 'AI Neural Kingdom',
    dailyTargetMinutes: 30,
    editorLanguage: 'python',
    codeFontSize: 14,
  })

  const [securityForm, setSecurityForm] = useState({
    currentCipher: '',
    newCipher: '',
    confirmCipher: '',
  })

  const totalXp = user?.xp || 450
  const level = user?.level || 1
  const xpInLevel = totalXp % 300
  const xpNeeded = 300

  const handleSave = async (sectionName) => {
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      // Simulate real asynchronous save latency with error protection
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSaveSuccess(true)
      toast.success(`${sectionName} preferences synchronized with Crystal Core!`)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.message || 'Failed to update settings')
      toast.error('Failed to synchronize with Crystal Core')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'learning', label: 'Learning', icon: Sliders },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <main className="crystal-settings-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <div className="settings-shell">
        {/* Header */}
        <header className="crystal-settings-header">
          <div className="settings-header-crest">
            <Sparkles size={26} className="crest-spark" />
          </div>
          <div>
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> SYSTEM NEXUS <span className="spark">✦</span>
            </p>
            <h1 className="crystal-title">
              CRYSTAL <span className="highlight">CORE SETTINGS</span>
            </h1>
            <p className="crystal-subtitle">
              Configure your TechVerse explorer identity, visual atmosphere, notification runes, and learning sanctums.
            </p>
          </div>
        </header>

        {/* Responsive Settings Navigation Tabs */}
        <nav className="settings-tabs-strip" role="tablist" aria-label="Settings categories">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                aria-controls={`panel-${id}`}
                aria-selected={isActive}
                type="button"
                className={`settings-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(id)
                  setSaveError('')
                  setSaveSuccess(false)
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
                {isActive && <span className="tab-crystal-pip" />}
              </button>
            )
          })}
        </nav>

        {/* Main Content Card Container */}
        <div className="settings-panel-container">
          <AnimatePresence mode="wait">
            {/* 1. ACCOUNT TAB */}
            {activeTab === 'account' && (
              <motion.section
                key="account"
                id="panel-account"
                role="tabpanel"
                aria-labelledby="tab-account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="crystal-panel settings-section-card"
              >
                <div className="settings-section-head">
                  <div>
                    <h3>Explorer Identity</h3>
                    <p>Manage your public persona, titles, and credentials across the TechVerse kingdoms.</p>
                  </div>
                  <span className="crystal-chip cyan">LEVEL {String(level).padStart(2, '0')}</span>
                </div>

                {/* Avatar & Character Overview Banner */}
                <div className="settings-identity-hero">
                  <div className="settings-avatar-wrap">
                    {accountForm.avatarUrl ? (
                      <img src={accountForm.avatarUrl} alt={accountForm.name} />
                    ) : (
                      <span>{accountForm.name.slice(0, 1).toUpperCase()}</span>
                    )}
                    <span className="settings-avatar-crown">
                      <Crown size={12} />
                    </span>
                  </div>

                  <div className="settings-identity-meta">
                    <h4 className="settings-identity-name">{accountForm.name}</h4>
                    <span className="field-hint">{accountForm.email}</span>
                    <div className="settings-identity-tags">
                      <span className="crystal-chip gold small">
                        <Sparkles size={11} /> {accountForm.realmTitle}
                      </span>
                      <span className="crystal-chip cyan small">
                        <Zap size={11} /> {totalXp.toLocaleString()} Total XP
                      </span>
                      <span className="crystal-chip small">
                        Level {level} ({xpInLevel}/{xpNeeded} XP)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="settings-form-grid">
                  <div className="settings-field">
                    <label htmlFor="settings-name">Explorer Name</label>
                    <input
                      id="settings-name"
                      type="text"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      className="crystal-input"
                      placeholder="Enter your explorer name"
                    />
                    <small className="field-hint">Your display moniker across the realm leaderboards.</small>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-email">Email Conduit</label>
                    <input
                      id="settings-email"
                      type="email"
                      value={accountForm.email}
                      disabled
                      className="crystal-input disabled"
                      title="Conduit locked to initial authentication account"
                    />
                    <small className="field-hint">Verified account conduit established during ascension.</small>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-title">Kingdom Title</label>
                    <input
                      id="settings-title"
                      type="text"
                      value={accountForm.realmTitle}
                      onChange={(e) => setAccountForm({ ...accountForm, realmTitle: e.target.value })}
                      className="crystal-input"
                      placeholder="e.g. Master of Neural Spire"
                    />
                    <small className="field-hint">Honorable title earned through domain mastery.</small>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-level">Level &amp; Rank Status</label>
                    <input
                      id="settings-level"
                      type="text"
                      value={`Level ${level} · ${(totalXp).toLocaleString()} XP Conquered`}
                      disabled
                      className="crystal-input disabled"
                    />
                    <small className="field-hint">Level progresses automatically via quizzes and battles.</small>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="settings-action-bar">
                  {saveSuccess && (
                    <span className="crystal-chip emerald small">
                      <Check size={12} /> Changes Saved!
                    </span>
                  )}
                  {saveError && (
                    <span className="crystal-chip ruby small">
                      <AlertCircle size={12} /> {saveError}
                    </span>
                  )}

                  <button
                    type="button"
                    className="crystal-btn crystal-btn-primary"
                    disabled={saving}
                    onClick={() => handleSave('Account')}
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={15} className="spin-icon" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={15} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.section>
            )}

            {/* 2. APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <motion.section
                key="appearance"
                id="panel-appearance"
                role="tabpanel"
                aria-labelledby="tab-appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="crystal-panel settings-section-card"
              >
                <div className="settings-section-head">
                  <div>
                    <h3>Kingdom Visual Atmosphere</h3>
                    <p>Customize universe shaders, crystal luminance, and particle density.</p>
                  </div>
                  <span className="crystal-chip">COSMIC DARK</span>
                </div>

                <div className="settings-options-list">
                  <div className="settings-option-row">
                    <div>
                      <strong>Cosmic Realm Theme</strong>
                      <p>Color grading for citadel panels, space backgrounds, and nebula auras.</p>
                    </div>
                    <select
                      className="crystal-select"
                      value={appearance.theme}
                      onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                      aria-label="Cosmic theme"
                    >
                      <option value="cosmic-citadel">Citadel Cosmic (Deep Navy &amp; Violet)</option>
                      <option value="aurora-neon">Aurora Neon (Cyan &amp; Electric Blue)</option>
                      <option value="deep-abyss">Deep Space Obsidian (Minimal Shadows)</option>
                    </select>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Crystal Glow Luminance</strong>
                      <p>Adjust neon border intensities, glowing ley-lines, and crystal hover pulses.</p>
                    </div>
                    <select
                      className="crystal-select"
                      value={appearance.glowIntensity}
                      onChange={(e) => setAppearance({ ...appearance, glowIntensity: e.target.value })}
                      aria-label="Glow luminance"
                    >
                      <option value="subtle">Subtle Shimmer (Low Glow)</option>
                      <option value="vibrant">Vibrant Crystal (Recommended)</option>
                      <option value="overcharged">Overcharged Energy (Maximum Radiance)</option>
                    </select>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Stardust &amp; Floating Particles</strong>
                      <p>Render lightweight animated background star dust and cosmic energy floating shards.</p>
                    </div>
                    <label className="crystal-switch" aria-label="Toggle background particles">
                      <input
                        type="checkbox"
                        checked={appearance.particlesEnabled}
                        onChange={(e) => setAppearance({ ...appearance, particlesEnabled: e.target.checked })}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                </div>

                <div className="settings-action-bar">
                  {saveSuccess && (
                    <span className="crystal-chip emerald small">
                      <Check size={12} /> Applied!
                    </span>
                  )}
                  <button
                    type="button"
                    className="crystal-btn crystal-btn-primary"
                    disabled={saving}
                    onClick={() => handleSave('Appearance')}
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={15} className="spin-icon" /> Updating Shaders...
                      </>
                    ) : (
                      <>
                        <Save size={15} /> Apply Atmospheric Settings
                      </>
                    )}
                  </button>
                </div>
              </motion.section>
            )}

            {/* 3. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.section
                key="notifications"
                id="panel-notifications"
                role="tabpanel"
                aria-labelledby="tab-notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="crystal-panel settings-section-card"
              >
                <div className="settings-section-head">
                  <div>
                    <h3>Transmissions &amp; Relic Runes</h3>
                    <p>Configure which alerts awaken your knowledge conduit.</p>
                  </div>
                  <span className="crystal-chip gold">REALM COMMS</span>
                </div>

                <div className="settings-options-list">
                  <div className="settings-option-row">
                    <div>
                      <strong>Daily Quest Reminders</strong>
                      <p>Receive transmissions for fresh daily learning spires and algorithmic challenges.</p>
                    </div>
                    <label className="crystal-switch" aria-label="Daily quest alerts">
                      <input
                        type="checkbox"
                        checked={notifications.dailyQuestAlerts}
                        onChange={(e) => setNotifications({ ...notifications, dailyQuestAlerts: e.target.checked })}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Streak Flame Protection Alert</strong>
                      <p>Warning signals before your daily unbroken learning flame cools down.</p>
                    </div>
                    <label className="crystal-switch" aria-label="Streak reminders">
                      <input
                        type="checkbox"
                        checked={notifications.streakReminders}
                        onChange={(e) => setNotifications({ ...notifications, streakReminders: e.target.checked })}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Tech Chronicles Dispatches</strong>
                      <p>Signals when major technology news breaks across the engineering realms.</p>
                    </div>
                    <label className="crystal-switch" aria-label="News dispatches">
                      <input
                        type="checkbox"
                        checked={notifications.chronicleDispatches}
                        onChange={(e) => setNotifications({ ...notifications, chronicleDispatches: e.target.checked })}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Battle Arena Duels Sound Effects</strong>
                      <p>Auditory crystals chime when scoring critical hits and answering battle questions.</p>
                    </div>
                    <label className="crystal-switch" aria-label="Sound effects">
                      <input
                        type="checkbox"
                        checked={notifications.soundEffects}
                        onChange={(e) => setNotifications({ ...notifications, soundEffects: e.target.checked })}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                </div>

                <div className="settings-action-bar">
                  <button
                    type="button"
                    className="crystal-btn crystal-btn-primary"
                    disabled={saving}
                    onClick={() => handleSave('Notification')}
                  >
                    <Save size={15} /> Save Notification Runes
                  </button>
                </div>
              </motion.section>
            )}

            {/* 4. LEARNING PREFERENCES TAB */}
            {activeTab === 'learning' && (
              <motion.section
                key="learning"
                id="panel-learning"
                role="tabpanel"
                aria-labelledby="tab-learning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="crystal-panel settings-section-card"
              >
                <div className="settings-section-head">
                  <div>
                    <h3>Learning Sanctum Preferences</h3>
                    <p>Tune your curriculum priorities, daily time commitment, and preferred coding language.</p>
                  </div>
                  <span className="crystal-chip cyan">ORACLE TUNING</span>
                </div>

                <div className="settings-options-list">
                  <div className="settings-option-row">
                    <div>
                      <strong>Primary Focus Domain</strong>
                      <p>The AI Oracle prioritizes recommendations and quest paths for this discipline.</p>
                    </div>
                    <select
                      className="crystal-select"
                      value={learningPrefs.primaryRealm}
                      onChange={(e) => setLearningPrefs({ ...learningPrefs, primaryRealm: e.target.value })}
                      aria-label="Primary focus domain"
                    >
                      <option value="AI Neural Kingdom">Artificial Intelligence &amp; ML</option>
                      <option value="Web Crystal City">Web Development</option>
                      <option value="Cloud Sky Kingdom">Cloud Computing</option>
                      <option value="Cyber Fortress">Cybersecurity</option>
                      <option value="Data Vault">Data Science &amp; Metrics</option>
                    </select>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Default Coding Arena Language</strong>
                      <p>Preferred language syntax loaded inside algorithmic coding quests.</p>
                    </div>
                    <select
                      className="crystal-select"
                      value={learningPrefs.editorLanguage}
                      onChange={(e) => setLearningPrefs({ ...learningPrefs, editorLanguage: e.target.value })}
                      aria-label="Editor language"
                    >
                      <option value="python">Python 3 (Sanctum Mode)</option>
                      <option value="javascript">JavaScript / TypeScript</option>
                    </select>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Daily Dedication Goal</strong>
                      <p>Target active exploration and coding practice minutes per day.</p>
                    </div>
                    <div className="settings-stat-choice" role="group" aria-label="Daily goal">
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          className={`crystal-chip ${learningPrefs.dailyTargetMinutes === mins ? 'active' : ''}`}
                          onClick={() => setLearningPrefs({ ...learningPrefs, dailyTargetMinutes: mins })}
                        >
                          {mins} Mins
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="settings-action-bar">
                  <button
                    type="button"
                    className="crystal-btn crystal-btn-primary"
                    disabled={saving}
                    onClick={() => handleSave('Learning')}
                  >
                    <Save size={15} /> Save Learning Goals
                  </button>
                </div>
              </motion.section>
            )}

            {/* 5. SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.section
                key="security"
                id="panel-security"
                role="tabpanel"
                aria-labelledby="tab-security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="crystal-panel settings-section-card"
              >
                <div className="settings-section-head">
                  <div>
                    <h3>Aegis &amp; Identity Protection</h3>
                    <p>Cryptographic seals guarding your adventurer credentials and tokens.</p>
                  </div>
                  <span className="crystal-chip emerald">AEGIS SHIELD ACTIVE</span>
                </div>

                <div className="settings-options-list">
                  <div className="settings-option-row">
                    <div>
                      <strong>Authentication Cipher</strong>
                      <p>Password forged with BCrypt salted hashing and secured in the realm vault.</p>
                    </div>
                    <button
                      type="button"
                      className="crystal-btn crystal-btn-secondary small"
                      onClick={() => toast('Cipher update ritual available. Contact citadel admin.')}
                    >
                      Update Password Cipher
                    </button>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Active Citadel Session</strong>
                      <p>Current device attuned to TechVerse Central Citadel with JWT token signature.</p>
                    </div>
                    <span className="crystal-chip emerald">Online Now</span>
                  </div>

                  <div className="settings-option-row">
                    <div>
                      <strong>Account Realm Security Tier</strong>
                      <p>Trial of Ascension completed. Placement gate unlocked.</p>
                    </div>
                    <span className="crystal-chip cyan">Verified Explorer</span>
                  </div>
                </div>

                <div className="settings-notice-box">
                  <Shield size={20} className="notice-icon" />
                  <p>
                    All realm transactions, assessments, and coding submissions are validated with server-grade cryptographic token signatures.
                  </p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
