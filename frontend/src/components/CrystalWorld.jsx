import { useState } from 'react'
import {
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Globe2,
  Lock,
  Shield,
  Castle,
  CheckCircle2,
} from 'lucide-react'
import crystalHero from '../assets/techverse-crystal-hero.png'
import './CrystalWorld.css'

// Kingdom Technology Domains Visual Definitions
const domainVisuals = [
  {
    match: 'artificial intelligence',
    kingdomName: 'AI KINGDOM',
    realmType: 'Archmage Tower',
    icon: BrainCircuit,
    tone: 'violet',
    glowColor: '#a855f7',
    tagline: 'Neural Spire & Machine Learning',
  },
  {
    match: 'cloud computing',
    kingdomName: 'CLOUD KINGDOM',
    realmType: 'Floating Citadel',
    icon: Cloud,
    tone: 'cyan',
    glowColor: '#22d3ee',
    tagline: 'Server Bastions & Distributed Haven',
  },
  {
    match: 'web development',
    kingdomName: 'WEB KINGDOM',
    realmType: 'Code Spire',
    icon: Code2,
    tone: 'blue',
    glowColor: '#38bdf8',
    tagline: 'Holographic DOM & Interface Towers',
  },
  {
    match: 'cybersecurity',
    kingdomName: 'CYBER KINGDOM',
    realmType: 'Aegis Fortress',
    icon: Shield,
    tone: 'electric',
    glowColor: '#6366f1',
    tagline: 'Quantum Gates & Defense Walls',
  },
  {
    match: 'data science',
    kingdomName: 'DATA KINGDOM',
    realmType: 'Crystal Observatory',
    icon: Database,
    tone: 'mint',
    glowColor: '#2dd4bf',
    tagline: 'Analytics Sanctuary & Astral Metrics',
  },
  {
    match: 'devops',
    kingdomName: 'INFRA KINGDOM',
    realmType: 'Forge Citadel',
    icon: GitBranch,
    tone: 'pink',
    glowColor: '#ec4899',
    tagline: 'Continuous Pipelines & Orchestration',
  },
]

// RPG Kingdom Map Coordinate Topology (arranged like the Kingdom Map specification)
// AI Kingdom (North), Cloud (West), Web (East), Cyber (South-West), Data (South-East), Infra (Alternate)
const kingdomSlots = [
  { x: 50, y: 14, id: 'north' },        // AI Kingdom (North Spire)
  { x: 18, y: 48, id: 'west' },         // Cloud Kingdom (West)
  { x: 82, y: 48, id: 'east' },         // Web Kingdom (East)
  { x: 26, y: 84, id: 'south-west' },   // Cyber Kingdom (South-West Fortress)
  { x: 74, y: 84, id: 'south-east' },   // Data Kingdom (South-East Observatory)
  { x: 50, y: 92, id: 'south' },        // Infra Kingdom (Deep South Forge)
]

function getDomainVisual(domain) {
  return domainVisuals.find(({ match }) => domain.toLowerCase().includes(match)) || {
    kingdomName: domain.toUpperCase(),
    realmType: 'Domain Citadel',
    icon: Globe2,
    tone: 'violet',
    glowColor: '#8b5cf6',
    tagline: 'Knowledge Bastion',
  }
}

function getIslandStatus(path) {
  const modules = path.modules || []
  if (modules.length && modules.every((module) => module.status === 'completed')) return 'completed'
  if (modules.some((module) => module.status === 'unlocked')) return path.completedModuleCount > 0 ? 'in-progress' : 'available'
  return 'locked'
}

export function ProgressRing({ value, label, children, tone = 'violet' }) {
  const progress = Math.max(0, Math.min(100, value || 0))
  return (
    <span
      className={`kingdom-progress-ring ring-${tone}`}
      style={{ '--ring-progress': `${progress}%` }}
      role="img"
      aria-label={`${label}: ${progress}%`}
    >
      <span className="ring-inner">{children || `${progress}%`}</span>
    </span>
  )
}

export function KingdomIsland({ path, position, onSelect, focused = false }) {
  const visual = getDomainVisual(path.domain)
  const Icon = visual.icon
  const modules = path.modules || []
  const completed = modules.filter((module) => module.status === 'completed').length
  const status = getIslandStatus(path)
  const nextModule = modules.find((module) => module.status === 'unlocked')
  const isLocked = status === 'locked'

  return (
    <button
      className={`kingdom-island-card ${visual.tone} ${status} ${focused ? 'zoom-focus' : ''}`}
      style={{
        '--island-x': `${position.x}%`,
        '--island-y': `${position.y}%`,
        '--island-order': position.order,
      }}
      type="button"
      onClick={() => onSelect(path, nextModule)}
      aria-label={`${visual.kingdomName}, ${completed} of ${modules.length} modules completed, ${status}`}
    >
      {/* 3D Platform & Tower Glow Accents */}
      <span className="kingdom-island-platform" />
      <span className="kingdom-spire-silhouette" />
      <span className="kingdom-floating-crystal shard-1" />
      <span className="kingdom-floating-crystal shard-2" />

      {/* Progress & Realm Crest */}
      <div className="kingdom-island-crest">
        {isLocked ? (
          <span className="island-locked-seal" title="Locked Domain Realm">
            <Lock size={18} className="lock-glyph" />
          </span>
        ) : (
          <ProgressRing value={path.progressPercentage} label={`${visual.kingdomName} progress`} tone={visual.tone}>
            {status === 'completed' ? (
              <CheckCircle2 size={18} className="complete-glyph" />
            ) : (
              <Icon size={18} strokeWidth={2} />
            )}
          </ProgressRing>
        )}
      </div>

      {/* Kingdom Domain Text */}
      <div className="kingdom-island-meta">
        <span className="kingdom-realm-badge">{visual.realmType}</span>
        <strong className="kingdom-island-name">{visual.kingdomName}</strong>
        <span className="kingdom-island-count">
          {completed} / {modules.length} Spire Quests
        </span>
      </div>

      {/* Energy Mini Bar */}
      <span className="kingdom-island-energy">
        <i style={{ width: `${path.progressPercentage || 0}%` }} />
      </span>

      {/* Tooltip on Hover */}
      <span className="kingdom-island-tooltip">
        <span className="tooltip-tag">{visual.realmType}</span>
        <strong>{visual.kingdomName}</strong>
        <small>{visual.tagline}</small>
        <span className={`tooltip-status status-${status}`}>
          {status === 'completed' && '✦ Realm Conquered'}
          {status === 'in-progress' && '⚔️ Campaign In Progress'}
          {status === 'available' && '✨ Ready to Enter'}
          {status === 'locked' && '🔒 Sealed by Runes'}
        </span>
      </span>
    </button>
  )
}

export function CentralCitadel({ onSelect, focused = false }) {
  return (
    <button
      className={`kingdom-central-citadel ${focused ? 'zoom-focus' : ''}`}
      type="button"
      onClick={onSelect}
      title="TechVerse Central Castle — Enter Main Citadel"
    >
      <span className="citadel-orbit orbit-1" />
      <span className="citadel-orbit orbit-2" />
      <span className="citadel-light-pillar" />

      <div className="citadel-castle-frame">
        <img src={crystalHero} alt="TechVerse Central Castle" />
        <div className="citadel-core-glow" />
      </div>

      <span className="citadel-energy-particle particle-1" />
      <span className="citadel-energy-particle particle-2" />
      <span className="citadel-energy-particle particle-3" />

      <span className="citadel-emblem">
        <Castle size={14} className="citadel-castle-mini" />
        CENTRAL CASTLE
      </span>
      <strong>TechVerse Citadel</strong>
      <small>Grand Nexus of All Realms</small>
    </button>
  )
}

function connectionPath(position) {
  // Curved magical ley lines emanating from Central Citadel (50, 50)
  const middleX = (50 + position.x) / 2 + (position.x < 50 ? -5 : 5)
  const middleY = (50 + position.y) / 2 + (position.y < 50 ? -3 : 3)
  return `M 50 50 Q ${middleX} ${middleY} ${position.x} ${position.y}`
}

export default function CrystalWorld({ paths = [], loading = false, error = '', onSelectIsland, onSelectCitadel }) {
  const [focusedDomain, setFocusedDomain] = useState('')
  const [citadelFocused, setCitadelFocused] = useState(false)

  const positionedPaths = paths.slice(0, kingdomSlots.length).map((path, index) => ({
    path,
    position: { ...kingdomSlots[index], order: index },
  }))

  const updateParallax = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    const element = event.currentTarget
    element.style.setProperty('--parallax-bg-x', `${offsetX * -4}px`)
    element.style.setProperty('--parallax-bg-y', `${offsetY * -4}px`)
    element.style.setProperty('--parallax-islands-x', `${offsetX * 5}px`)
    element.style.setProperty('--parallax-islands-y', `${offsetY * 5}px`)
    element.style.setProperty('--parallax-citadel-x', `${offsetX * 8}px`)
    element.style.setProperty('--parallax-citadel-y', `${offsetY * 8}px`)
  }

  const resetParallax = (event) => {
    for (const property of ['--parallax-bg-x', '--parallax-bg-y', '--parallax-islands-x', '--parallax-islands-y', '--parallax-citadel-x', '--parallax-citadel-y']) {
      event.currentTarget.style.removeProperty(property)
    }
  }

  const focusIsland = (path, module) => {
    setFocusedDomain(path.domain)
    window.setTimeout(() => {
      setFocusedDomain('')
      onSelectIsland(path, module)
    }, 280)
  }

  const focusCitadel = () => {
    setCitadelFocused(true)
    window.setTimeout(() => {
      setCitadelFocused(false)
      onSelectCitadel()
    }, 260)
  }

  return (
    <section className="tech-kingdom-map-panel" aria-label="Tech Kingdom Learning Map">
      {/* Map Header */}
      <div className="kingdom-map-header">
        <div className="map-header-left">
          <span className="kingdom-crest-badge">
            <Castle size={14} className="crest-icon" />
            WORLD PROGRESSION MAP
          </span>
          <h2>The Tech Kingdom</h2>
          <p>Each domain is a realm in the kingdom. Journey through the spires to conquer technology.</p>
        </div>

        <div className="kingdom-map-legend">
          <span className="legend-chip unlocked">
            <i className="legend-dot" />
            <span>Unlocked</span>
          </span>
          <span className="legend-chip locked">
            <Lock size={11} />
            <span>Sealed</span>
          </span>
          <span className="legend-counter">
            {paths.length} Technology Realms
          </span>
        </div>
      </div>

      {/* Main Map Viewport */}
      {loading ? (
        <div className="kingdom-map-empty" role="status">
          <div className="map-loading-crystal" />
          <span>Summoning Kingdom Ley Lines...</span>
        </div>
      ) : error ? (
        <div className="kingdom-map-empty error" role="alert">
          <span>{error}</span>
        </div>
      ) : !paths.length ? (
        <div className="kingdom-map-empty">
          <span>No technological realms mapped yet. Begin by taking your skill assessment.</span>
        </div>
      ) : (
        <div
          className="kingdom-map-canvas"
          onPointerMove={updateParallax}
          onPointerLeave={resetParallax}
        >
          {/* Ambient Cosmic Atmosphere & Star Dust */}
          <div className="kingdom-map-atmosphere" aria-hidden="true" />
          <div className="map-dust-star dust-1" />
          <div className="map-dust-star dust-2" />
          <div className="map-dust-star dust-3" />
          <div className="map-dust-star dust-4" />

          {/* SVG Ley Lines & Energy Travelers between Citadel & Kingdoms */}
          <svg className="kingdom-ley-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="leyPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {positionedPaths.map(({ path, position }, index) => {
              const visual = getDomainVisual(path.domain)
              const status = getIslandStatus(path)
              const d = connectionPath(position)
              return (
                <g key={path.domain}>
                  <path
                    d={d}
                    className={`ley-path ${visual.tone} ${status}`}
                  />
                  {status !== 'locked' && (
                    <circle r="0.75" className={`ley-traveler ${visual.tone}`}>
                      <animateMotion dur={`${8 + index * 2}s`} repeatCount="indefinite" path={d} />
                    </circle>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Central Castle (TechVerse Citadel) */}
          <CentralCitadel onSelect={focusCitadel} focused={citadelFocused} />

          {/* Kingdom Technology Domains */}
          {positionedPaths.map(({ path, position }) => (
            <KingdomIsland
              key={path.domain}
              path={path}
              position={position}
              focused={focusedDomain === path.domain}
              onSelect={(selectedPath, module) => focusIsland(selectedPath, module)}
            />
          ))}
        </div>
      )}
    </section>
  )
}