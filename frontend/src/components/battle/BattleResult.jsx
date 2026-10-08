import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, ShieldAlert, Sparkles, Trophy, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BattleResult({ battle, result, onRetry }) {
  const victory = result.victory
  return (
    <motion.section className={`battle-result-panel ${victory ? 'victory' : 'defeat'}`} initial={{ opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <div className="battle-result-crest">{victory ? <Trophy size={30} /> : <ShieldAlert size={30} />}</div>
      <p className="panel-kicker">{victory ? 'Challenge complete' : 'Challenge incomplete'}</p>
      <h1>{victory ? 'Battle won' : 'Try again'}</h1>
      <strong className="battle-result-enemy">{battle.domain} challenge</strong>
      <div className="battle-result-stats"><span><small>QUESTIONS</small><b>{result.questionsAnswered} / {result.totalQuestions}</b></span><span><small>CORRECT</small><b>{result.correctAnswers}</b></span><span><small>XP</small><b>+{result.xpAwarded}</b></span></div>
      {victory ? <div className="battle-reward-banner"><Zap size={20} /> +{result.xpAwarded} XP <small>ADDED TO YOUR PROGRESS</small></div> : <p className="battle-defeat-note">No XP awarded. Restore your focus and try again.</p>}
      {victory && result.nextBattleUnlocked && result.nextBattle && <div className="battle-next-unlock"><Sparkles size={17} /><span><small>Next challenge available</small><strong>{result.nextBattle.domain} · Challenge {result.nextBattle.order}</strong></span></div>}
      <div className="battle-result-actions"><Link to="/battle" className="secondary-button"><ArrowLeft size={16} /> Return to Arena</Link>{!victory && <button className="primary-button" type="button" onClick={onRetry}><RotateCcw size={16} /> Retry Battle</button>}</div>
    </motion.section>
  )
}
