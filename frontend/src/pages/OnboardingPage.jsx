import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, Cloud, Code2, Database, Shield, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const realms = [
  { id: 'ai', name: 'AI Neural Realm', domain: 'Artificial Intelligence', icon: BrainCircuit, tone: 'violet', desc: 'Neural architectures, ML logic & Gemini mentors' },
  { id: 'web', name: 'Web Crystal City', domain: 'Web Development', icon: Code2, tone: 'cyan', desc: 'Modern responsive interfaces & DOM engines' },
  { id: 'cloud', name: 'Cloud Sky Kingdom', domain: 'Cloud Computing', icon: Cloud, tone: 'teal', desc: 'Distributed server bastions & container mesh' },
  { id: 'cyber', name: 'Cyber Fortress', domain: 'Cybersecurity', icon: Shield, tone: 'electric', desc: 'Quantum defensive shields & intrusion aegis' },
  { id: 'data', name: 'Data Vault', domain: 'Data Science', icon: Database, tone: 'mint', desc: 'Predictive analytics & astral metric crystals' },
]

export default function OnboardingPage() {
  const [selectedRealm, setSelectedRealm] = useState('ai')

  return (
    <main className="onboarding-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <div className="onboarding-shell">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="onboarding-card crystal-panel"
        >
          <div className="onboarding-crest">
            <Sparkles size={24} className="crest-spark" />
          </div>

          <p className="crystal-eyebrow">
            <span className="spark">✦</span> GATEWAY OF TECHVERSE <span className="spark">✦</span>
          </p>

          <h1 className="crystal-title">
            CHOOSE <span className="highlight">YOUR PATH</span>
          </h1>

          <p className="onboarding-copy">
            Every technology is an authentic crystal world. Select your starting affinity realm,
            then undertake the Trial of Ascension to calibrate your personalized curriculum.
          </p>

          <div className="world-grid">
            {realms.map(({ id, name, icon: Icon, tone, desc }) => (
              <button
                key={id}
                type="button"
                className={`world-tile tone-${tone} ${selectedRealm === id ? 'selected' : ''}`}
                onClick={() => setSelectedRealm(id)}
              >
                <div className="world-icon-wrap">
                  <Icon size={24} />
                </div>
                <strong>{name}</strong>
                <small>{desc}</small>
                {selectedRealm === id && <span className="world-selected-pip" />}
              </button>
            ))}
          </div>

          <div className="onboarding-cta-wrap">
            <Link to="/placement-test" className="crystal-btn crystal-btn-primary large onboarding-cta">
              <Sparkles size={17} /> BEGIN SKILL ASSESSMENT <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
