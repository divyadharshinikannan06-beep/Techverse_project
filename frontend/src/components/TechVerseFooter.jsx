import { Castle, Sparkles, BookOpen, Code2, Swords, Trophy, Award, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import crystalHero from '../assets/techverse-crystal-hero.png'

export default function TechVerseFooter() {
  return (
    <footer className="tv-cinematic-footer">
      <div className="footer-citadel-backdrop" aria-hidden="true">
        <img src={crystalHero} alt="" className="footer-citadel-art" />
        <div className="footer-citadel-fade" />
      </div>

      <div className="footer-glow-line" />

      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/dashboard" className="footer-logo">
              <span className="footer-logo-gem">
                <span className="logo-orbital-ring" />
                <span className="logo-tv-text">TV</span>
                <Sparkles size={11} className="logo-sparkle" />
              </span>
              <div className="footer-logo-text">
                <strong>TechVerse</strong>
                <span>CRYSTAL KINGDOM</span>
              </div>
            </Link>

            <p className="footer-tagline">
              "Enter the Crystal Kingdom of Technology"
            </p>
            <p className="footer-desc">
              A gamified learning universe where engineering mastery unlocks ancient crystal realms.
              Learn, practice algorithmic challenges, duel in knowledge arenas, and consult the AI Oracle.
            </p>

            <div className="footer-motto">
              <span>LEARN</span> • <span>PRACTICE</span> • <span>COMPETE</span> • <span>GROW</span>
            </div>
          </div>

          {/* Navigation: Technology Realms */}
          <div className="footer-links-col">
            <h4>Technology Realms</h4>
            <ul>
              <li><Link to="/worlds"><span className="bullet-gem" /> AI Neural Kingdom</Link></li>
              <li><Link to="/worlds"><span className="bullet-gem" /> Web Crystal City</Link></li>
              <li><Link to="/worlds"><span className="bullet-gem" /> Cloud Sky Kingdom</Link></li>
              <li><Link to="/worlds"><span className="bullet-gem" /> Data Vault &amp; Metrics</Link></li>
              <li><Link to="/worlds"><span className="bullet-gem" /> Cyber Fortress &amp; Aegis</Link></li>
              <li><Link to="/worlds"><span className="bullet-gem" /> DevOps Command Realm</Link></li>
            </ul>
          </div>

          {/* Navigation: Practice & Arena */}
          <div className="footer-links-col">
            <h4>Practice &amp; Sanctums</h4>
            <ul>
              <li><Link to="/coding"><Code2 size={14} /> Coding Sanctum</Link></li>
              <li><Link to="/battle"><Swords size={14} /> Battle Arena</Link></li>
              <li><Link to="/worlds"><BookOpen size={14} /> Kingdom Spires &amp; Quests</Link></li>
              <li><Link to="/ai-lab"><Sparkles size={14} /> AI Wizard Tower</Link></li>
              <li><Link to="/placement"><Shield size={14} /> Trial of Ascension</Link></li>
            </ul>
          </div>

          {/* Navigation: Champions & Community */}
          <div className="footer-links-col">
            <h4>Citadel Records</h4>
            <ul>
              <li><Link to="/leaderboard"><Trophy size={14} /> Hall of Champions</Link></li>
              <li><Link to="/badges"><Award size={14} /> Royal Relics &amp; Badges</Link></li>
              <li><Link to="/profile"><Castle size={14} /> Explorer Sanctuary</Link></li>
              <li><Link to="/dashboard#tech-news"><Sparkles size={14} /> The Tech Chronicles</Link></li>
              <li><Link to="/settings"><Sparkles size={14} /> Crystal Core Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom-strip">
          <div className="footer-bottom-left">
            <span>© {new Date().getFullYear()} TechVerse. Enter the Crystal Kingdom of Technology.</span>
            <span className="footer-realm-indicator">
              <span className="realm-live-gem" /> Citadel Systems Online
            </span>
          </div>

          <div className="footer-bottom-links">
            <Link to="/dashboard">Citadel</Link>
            <Link to="/worlds">Realms</Link>
            <Link to="/coding">Arena</Link>
            <Link to="/leaderboard">Champions</Link>
            <Link to="/settings">Core</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
