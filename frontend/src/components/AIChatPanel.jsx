import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  BookOpenCheck,
  BrainCircuit,
  Code2,
  Copy,
  Check,
  Eraser,
  MessageSquareText,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Terminal,
  UserRound,
  Wand2,
  WandSparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AIChatPanel.css'

const MAX_HISTORY_MESSAGES = 10
const MAX_VISIBLE_MESSAGES = 30
const UNAVAILABLE_MESSAGE = 'The AI Wizard Tower is temporarily recharging its crystals. Please try asking again in a moment.'

// Lightweight Markdown Formatter for Code & Explanations
function FormattedMessage({ text }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const copyCode = (code, index) => {
    navigator.clipboard?.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g)

  return (
    <div className="ai-formatted-content">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n')
          const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines.shift() : 'code'
          const code = lines.join('\n')

          return (
            <div className="ai-code-block" key={index}>
              <div className="ai-code-header">
                <span><Terminal size={12} /> {language}</span>
                <button
                  type="button"
                  onClick={() => copyCode(code, index)}
                  title="Copy code"
                  className="ai-code-copy"
                >
                  {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="ai-code-body"><code>{code}</code></pre>
            </div>
          )
        }

        // Normal text with bolding and paragraph breaks
        const paragraphs = part.split(/\n\n+/)
        return (
          <div className="ai-text-block" key={index}>
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim()
              if (!trimmed) return null

              // Check if bullet point list
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split(/\n(?=[*-]|\d+\.)/)
                return (
                  <ul className="ai-bullet-list" key={pIdx}>
                    {items.map((item, iIdx) => {
                      const cleanItem = item.replace(/^[*-]|\d+\.\s*/, '').trim()
                      return (
                        <li key={iIdx}>
                          <span dangerouslySetInnerHTML={{
                            __html: cleanItem
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
                          }} />
                        </li>
                      )
                    })}
                  </ul>
                )
              }

              return (
                <p
                  key={pIdx}
                  dangerouslySetInnerHTML={{
                    __html: trimmed
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function AIChatPanel({ token: propToken, currentTopic = 'Computer Science' }) {
  const { token: authContextToken, user } = useAuth()
  const effectiveToken = propToken || authContextToken || localStorage.getItem('techverse-auth-token') || ''

  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryPrompt, setRetryPrompt] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const requestReply = async (question, history) => {
    setLoading(true)
    setError('')
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (effectiveToken) {
        headers.Authorization = `Bearer ${effectiveToken}`
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: question,
          history: history.slice(-MAX_HISTORY_MESSAGES),
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || !data) {
        throw new Error(data?.message || UNAVAILABLE_MESSAGE)
      }

      const reply = data.reply || data.answer || data.message
      if (typeof reply !== 'string' || !reply.trim()) {
        throw new Error(UNAVAILABLE_MESSAGE)
      }

      setMessages((current) => [...current, { role: 'assistant', content: reply }].slice(-MAX_VISIBLE_MESSAGES))
      setRetryPrompt(null)
    } catch (err) {
      setError(err.message || UNAVAILABLE_MESSAGE)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (prompt = message) => {
    const question = prompt.trim()
    if (!question || loading) return

    const history = messages.slice(-MAX_HISTORY_MESSAGES)
    setMessage('')
    setError('')
    setRetryPrompt({ message: question, history })
    setMessages((current) => [...current, { role: 'user', content: question }].slice(-MAX_VISIBLE_MESSAGES))

    await requestReply(question, history)
  }

  const quickActions = [
    { label: 'Explain Concept', icon: BrainCircuit, prompt: `Explain ${currentTopic} with an intuitive analogy, visual breakdown, and a clear real-world engineering example.` },
    { label: 'Debug My Code', icon: Code2, prompt: 'I need help debugging code. Ask me to paste my code and error message, then diagnose the root cause and provide the solution.' },
    { label: 'Technical Quiz', icon: BookOpenCheck, prompt: `Quiz me on ${currentTopic}! Give me one tricky multiple-choice question at a time and explain the reasoning after I answer.` },
    { label: 'Interview Practice', icon: MessageSquareText, prompt: 'Let us run a mock tech interview. Ask me one conceptual engineering question suitable for campus placement, wait for my response, and grade it.' },
    { label: 'Placement Roadmap', icon: Target, prompt: `Create a high-impact placement preparation study plan for ${currentTopic} covering core algorithms, system design topics, and typical interview rounds.` },
    { label: 'Summarize Realm', icon: WandSparkles, prompt: `Summarize the essential pillars of ${currentTopic} in 5 bullet points with key architectural concepts.` },
  ]

  const clearConversation = () => {
    setMessages([])
    setMessage('')
    setError('')
    setRetryPrompt(null)
    inputRef.current?.focus()
  }

  const studentName = user?.name ? user.name.split(' ')[0] : 'Apprentice'

  return (
    <section className="ai-wizard-tower-card" aria-labelledby="ai-tower-title">
      {/* Glowing atmospheric energy */}
      <div className="tower-energy-ring ring-1" aria-hidden="true" />
      <div className="tower-energy-ring ring-2" aria-hidden="true" />
      <div className="tower-crystal-shimmer" aria-hidden="true" />

      {/* Wizard Tower Header */}
      <header className="ai-tower-header">
        <div className="tower-orb-container">
          <div className="tower-orb-halo" />
          <div className="tower-orb-crystal">
            <Wand2 size={22} className="tower-wand-icon" />
            <Sparkles size={13} className="tower-sparkle-a" />
            <Sparkles size={11} className="tower-sparkle-b" />
          </div>
        </div>

        <div className="tower-title-block">
          <span className="tower-kicker-badge">
            <span className="tower-kicker-gem" />
            AI WIZARD TOWER · ORACLE OF TECHVERSE
          </span>
          <h2 id="ai-tower-title">AI LAB</h2>
          <p className="tower-subtitle">Ask the TechVerse AI — Your Royal Engineering Mentor &amp; Code Oracle</p>
        </div>

        <div className="tower-header-actions">
          <button
            className="tower-clear-btn"
            type="button"
            onClick={clearConversation}
            disabled={loading || (!messages.length && !error)}
            title="Clear current memory"
            aria-label="Clear conversation"
          >
            <Eraser size={15} />
            <span>Clear Memory</span>
          </button>
        </div>
      </header>

      {/* Main Chamber Layout */}
      <div className="ai-tower-chamber">
        {/* Quick Action Runes */}
        <aside className="ai-tower-runes" aria-label="Quick AI Spell Runes">
          <div className="tower-rune-heading">
            <Sparkles size={14} className="rune-spark" />
            <span>SPELL RUNES &amp; ACTIONS</span>
          </div>

          <div className="tower-rune-list">
            {quickActions.map(({ label, icon: Icon, prompt }) => (
              <button
                type="button"
                key={label}
                className="tower-rune-btn"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
              >
                <span className="rune-btn-icon"><Icon size={14} /></span>
                <span className="rune-btn-label">{label}</span>
              </button>
            ))}
          </div>

          <div className="tower-focus-realm">
            <span className="realm-tag">CURRENT DOMAIN REALM</span>
            <strong>{currentTopic}</strong>
            <span className="realm-greeting">Greetings, {studentName}. Ask anything.</span>
          </div>
        </aside>

        {/* Message Scroll Chamber */}
        <div className="ai-tower-scroll">
          <div
            className="tower-messages-viewport"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label="AI Wizard Tower dialogue"
          >
            {!messages.length && !loading && (
              <div className="tower-empty-sanctum">
                <div className="empty-crystal-core">
                  <Bot size={28} />
                  <div className="empty-core-ring" />
                </div>
                <h3>The AI Wizard Tower Awaits</h3>
                <p>
                  Inquire into algorithms, architecture, placement interviews, or debug troublesome code.
                  Every message is illuminated with the power of Gemini.
                </p>
                <div className="empty-rune-prompts">
                  <button type="button" onClick={() => sendMessage(quickActions[0].prompt)}>
                    ✨ Explain {currentTopic}
                  </button>
                  <button type="button" onClick={() => sendMessage(quickActions[1].prompt)}>
                    ⚔️ Debug My Code
                  </button>
                  <button type="button" onClick={() => sendMessage(quickActions[3].prompt)}>
                    🎯 Interview Practice
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((item, index) => (
                <motion.div
                  className={`tower-dialogue-card ${item.role}`}
                  key={`${index}-${item.role}`}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <div className="dialogue-crest">
                    {item.role === 'assistant' ? (
                      <span className="crest-oracle">
                        <Bot size={16} />
                      </span>
                    ) : (
                      <span className="crest-seeker">
                        <UserRound size={16} />
                      </span>
                    )}
                  </div>

                  <div className="dialogue-body">
                    <div className="dialogue-meta">
                      <span className="dialogue-author">
                        {item.role === 'assistant' ? 'TechVerse AI Oracle' : (user?.name || 'Student')}
                      </span>
                      <span className="dialogue-pill">
                        {item.role === 'assistant' ? '✦ Gemini Mentor' : 'Seeker'}
                      </span>
                    </div>
                    <FormattedMessage text={item.content} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                className="tower-dialogue-card assistant tower-thinking-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
              >
                <div className="dialogue-crest">
                  <span className="crest-oracle thinking-pulse">
                    <Bot size={16} />
                  </span>
                </div>
                <div className="dialogue-body">
                  <div className="dialogue-meta">
                    <span className="dialogue-author">TechVerse AI Oracle</span>
                    <span className="dialogue-pill thinking">Channeling...</span>
                  </div>
                  <div className="tower-typing-indicator">
                    <span className="gem-dot dot-1" />
                    <span className="gem-dot dot-2" />
                    <span className="gem-dot dot-3" />
                    <span className="thinking-text">Consulting the AI Wizard Tower...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {error && (
            <motion.div
              className="tower-error-barrier"
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="error-barrier-msg">
                <strong>Connection Disrupted:</strong>
                <span>{error}</span>
              </div>
              {retryPrompt && (
                <button
                  type="button"
                  className="tower-retry-btn"
                  onClick={() => requestReply(retryPrompt.message, retryPrompt.history)}
                  disabled={loading}
                >
                  <RotateCcw size={13} />
                  <span>Retry Spell</span>
                </button>
              )}
            </motion.div>
          )}

          {/* Interactive Rune Composer */}
          <form
            className="tower-composer-chamber"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <label className="sr-only" htmlFor="wizard-question-input">
              Ask TechVerse AI anything...
            </label>
            <textarea
              id="wizard-question-input"
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask TechVerse AI anything..."
              maxLength={2000}
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              className="tower-cast-button"
              aria-label="Ask AI"
              disabled={loading || !message.trim()}
            >
              <Sparkles size={15} className="cast-sparkle" />
              <span>Ask AI</span>
              <Send size={15} className="cast-send" />
            </button>
          </form>

          <footer className="tower-composer-footer">
            <span className="footer-crystal-hint">✦ Press Enter to send · Shift + Enter for newline</span>
            <span className="footer-gemini-badge">Powered by Gemini AI · Knowledge grounded in engineering</span>
          </footer>
        </div>
      </div>
    </section>
  )
}

