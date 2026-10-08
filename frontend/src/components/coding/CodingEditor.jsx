import { Code2, RotateCcw, Sparkles } from 'lucide-react'

export default function CodingEditor({ language, onLanguageChange, code, onCodeChange, starterCode }) {
  return (
    <section className="crystal-panel coding-workspace-panel futuristic-editor-frame">
      <div className="coding-editor-toolbar">
        <div className="coding-editor-title">
          <span className="coding-live-dot" />
          <Code2 size={16} />
          <strong>Crystal Code Editor</strong>
        </div>

        <label className="coding-language-select">
          <span className="sr-only">Programming language</span>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            aria-label="Programming language"
            className="crystal-select small"
          >
            <option value="python">🐍 Python 3</option>
            <option value="javascript">🟨 JavaScript</option>
          </select>
        </label>

        <button
          type="button"
          className="crystal-btn crystal-btn-secondary small coding-reset-btn"
          onClick={() => onCodeChange(starterCode)}
          aria-label="Reset code to starter template"
        >
          <RotateCcw size={13} />
          <span>RESET</span>
        </button>
      </div>

      <div className="coding-editor-wrap">
        <div className="coding-line-rail" aria-hidden="true">
          {Array.from({ length: Math.max(1, code.split('\n').length) }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <textarea
          className="coding-editor"
          aria-label={`${language} code editor`}
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
        />
      </div>

      <div className="coding-editor-footer">
        <span>UTF-8 · Crystal Syntax</span>
        <span>
          <Sparkles size={12} /> {language === 'python' ? 'Python · safe static checks' : 'JavaScript · safe static checks'}
        </span>
      </div>
    </section>
  )
}
