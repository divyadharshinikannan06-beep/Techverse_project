import { BrainCircuit, Code2, Sparkles, Trophy, Shield } from 'lucide-react'
import crystalHero from '../assets/techverse-crystal-hero.png'

export default function AuthBrandPanel() {
  return (
    <aside className="auth-brand-panel">
      {/* Brand Header */}
      <div className="auth-showcase-brand">
        <div className="kingdom-brand-mark">
          <span className="brand-orbital-ring" />
          <span className="brand-tv-monogram">TV</span>
          <Sparkles size={11} className="brand-diamond-sparkle" />
        </div>
        <div className="auth-brand-text">
          <strong>TechVerse</strong>
          <small>LEARN • PRACTICE • COMPETE • GROW</small>
        </div>
      </div>

      {/* Crystal Citadel Showcase Illustration */}
      <div className="auth-showcase-art" aria-hidden="true">
        <div className="auth-citadel-art-wrap">
          <img
            src={crystalHero}
            alt="The TechVerse Crystal Citadel"
            className="auth-citadel-img"
          />
          <div className="auth-citadel-overlay" />
        </div>

        <div className="auth-showcase-chips">
          <span className="crystal-chip cyan"><Sparkles size={12} /> 6 Crystal Realms</span>
          <span className="crystal-chip gold"><Trophy size={12} /> Hall of Champions</span>
          <span className="crystal-chip"><BrainCircuit size={12} /> Gemini AI Mentor</span>
        </div>
      </div>

      {/* Citadel Lore Copy */}
      <div className="auth-showcase-copy">
        <p className="auth-copy-tagline">"Enter the Crystal Kingdom of Technology"</p>
        <p className="auth-copy-sub">
          Master real-world engineering skills through gamified spire quests, live algorithmic duels, and server-awarded relics.
        </p>
      </div>
    </aside>
  )
}