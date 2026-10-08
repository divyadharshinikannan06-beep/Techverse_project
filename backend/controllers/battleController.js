const mongoose = require('mongoose')
const BattleSession = require('../models/BattleSession')
const { battles } = require('../data/battles')
const { completeBattleProgress, getBattleState } = require('../services/progressService')
const { evaluateAndAwardBadges } = require('../services/badgeService')
const { recordQualifyingActivity } = require('../services/streakService')

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true
  response.status(503).json({ status: 'error', message: 'The Battle Arena is temporarily unavailable' })
  return false
}

function findBattleState(state, battleId) {
  return state?.battles.find((battle) => battle.id === battleId) || null
}

function publicBattle(battle) {
  return {
    id: battle.id,
    domain: battle.domain,
    title: battle.title,
    description: battle.description,
    enemyName: battle.enemyName,
    enemyType: battle.enemyType,
    difficulty: battle.difficulty,
    questionCount: battle.questionCount,
    xpReward: battle.xpReward,
    order: battle.order,
  }
}

function publicQuestion(question) {
  return { questionId: question.questionId, question: question.question, options: question.options }
}

async function listBattles(request, response) {
  if (!databaseReady(response)) return
  try {
    const state = await getBattleState(request.user._id)
    if (!state) {
      response.status(404).json({ status: 'error', message: 'Complete your assessment to reveal the Battle Arena' })
      return
    }
    response.status(200).json({
      status: 'success',
      totalXP: state.totalXP,
      battles: state.battles.map((battleState) => ({ ...publicBattle(battles.find((battle) => battle.id === battleState.id)), ...battleState })),
    })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load battles right now' })
  }
}

async function getBattle(request, response) {
  if (!databaseReady(response)) return
  try {
    const battle = battles.find((item) => item.id === request.params.battleId)
    if (!battle) {
      response.status(404).json({ status: 'error', message: 'Battle not found' })
      return
    }
    const state = await getBattleState(request.user._id)
    if (!state) {
      response.status(404).json({ status: 'error', message: 'Complete your assessment before entering a battle' })
      return
    }
    const battleState = findBattleState(state, battle.id)
    if (!battleState) {
      response.status(404).json({ status: 'error', message: 'Battle is not part of your personalized path' })
      return
    }
    if (battleState.status === 'locked') {
      response.status(423).json({ status: 'error', message: battleState.lockedReason })
      return
    }
    if (battleState.status === 'completed') {
      response.status(409).json({ status: 'error', message: 'This battle has already been completed' })
      return
    }
    response.status(200).json({ status: 'success', battle: { ...publicBattle(battle), ...battleState } })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load this battle right now' })
  }
}

async function startBattle(request, response) {
  if (!databaseReady(response)) return
  const { battleId } = request.body || {}
  if (typeof battleId !== 'string' || !battleId.trim()) {
    response.status(400).json({ status: 'error', message: 'A battleId is required' })
    return
  }
  try {
    const battle = battles.find((item) => item.id === battleId)
    if (!battle) {
      response.status(404).json({ status: 'error', message: 'Battle not found' })
      return
    }
    const state = await getBattleState(request.user._id)
    if (!state) {
      response.status(404).json({ status: 'error', message: 'Complete your assessment before starting a battle' })
      return
    }
    const battleState = findBattleState(state, battleId)
    if (!battleState) {
      response.status(404).json({ status: 'error', message: 'Battle is not part of your personalized path' })
      return
    }
    if (battleState.status === 'locked') {
      response.status(423).json({ status: 'error', message: battleState.lockedReason })
      return
    }
    if (battleState.status === 'completed') {
      response.status(409).json({ status: 'error', message: 'This battle has already been completed' })
      return
    }

    const session = await BattleSession.create({ userId: request.user._id, battleId })
    response.status(201).json({
      status: 'success',
      sessionId: String(session._id),
      battle: publicBattle(battle),
      playerHp: session.playerHp,
      enemyHp: session.enemyHp,
      questionIndex: 0,
      totalQuestions: battle.questions.length,
      question: publicQuestion(battle.questions[0]),
    })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to start this battle right now' })
  }
}

async function answerBattleQuestion(request, response) {
  if (!databaseReady(response)) return
  const { sessionId, questionId, answer } = request.body || {}
  if (typeof sessionId !== 'string' || !mongoose.isValidObjectId(sessionId)) {
    response.status(400).json({ status: 'error', message: 'A valid sessionId is required' })
    return
  }
  if (typeof questionId !== 'string' || !Number.isInteger(answer) || answer < 0 || answer > 3) {
    response.status(400).json({ status: 'error', message: 'Submit a questionId and answer index from 0 to 3' })
    return
  }

  try {
    const session = await BattleSession.findOne({ _id: sessionId, userId: request.user._id })
    if (!session) {
      response.status(404).json({ status: 'error', message: 'Battle session not found' })
      return
    }
    if (session.status !== 'active') {
      response.status(409).json({ status: 'error', message: 'This battle has already finished' })
      return
    }
    const battle = battles.find((item) => item.id === session.battleId)
    if (!battle) {
      response.status(404).json({ status: 'error', message: 'Battle definition is no longer available' })
      return
    }
    if (session.answers.some((item) => item.questionId === questionId)) {
      response.status(409).json({ status: 'error', message: 'This battle question has already been answered' })
      return
    }
    const question = battle.questions[session.questionIndex]
    if (!question || question.questionId !== questionId) {
      response.status(400).json({ status: 'error', message: 'Answer the current battle question before continuing' })
      return
    }

    const correct = answer === question.correctAnswer
    const playerHp = correct ? session.playerHp : Math.max(0, session.playerHp - 20)
    const enemyHp = correct ? Math.max(0, session.enemyHp - 20) : session.enemyHp
    const nextIndex = session.questionIndex + 1
    const status = enemyHp === 0 ? 'victory' : playerHp === 0 || nextIndex >= battle.questions.length ? 'defeat' : 'active'
    const updated = await BattleSession.findOneAndUpdate(
      { _id: session._id, userId: request.user._id, status: 'active', questionIndex: session.questionIndex },
      {
        $push: { answers: { questionId, answerIndex: answer, correct, answeredAt: new Date() } },
        ...(correct ? { $inc: { correctAnswers: 1 } } : {}),
        $set: { playerHp, enemyHp, questionIndex: nextIndex, status },
      },
      { returnDocument: 'after', runValidators: true },
    )
    if (!updated) {
      response.status(409).json({ status: 'error', message: 'Battle state changed; refresh the arena before answering' })
      return
    }

    const battleFinished = updated.status !== 'active'
    response.status(200).json({
      status: 'success',
      correct,
      playerHp: updated.playerHp,
      enemyHp: updated.enemyHp,
      questionComplete: true,
      battleFinished,
      result: battleFinished ? updated.status : null,
      nextQuestion: battleFinished ? null : publicQuestion(battle.questions[updated.questionIndex]),
      answeredQuestions: updated.answers.length,
      totalQuestions: battle.questions.length,
    })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to record this battle answer right now' })
  }
}

async function finishBattle(request, response) {
  if (!databaseReady(response)) return
  const { sessionId } = request.body || {}
  if (typeof sessionId !== 'string' || !mongoose.isValidObjectId(sessionId)) {
    response.status(400).json({ status: 'error', message: 'A valid sessionId is required' })
    return
  }
  try {
    const session = await BattleSession.findOne({ _id: sessionId, userId: request.user._id })
    if (!session) {
      response.status(404).json({ status: 'error', message: 'Battle session not found' })
      return
    }
    if (session.status === 'active') {
      response.status(409).json({ status: 'error', message: 'Finish the questions before ending the battle' })
      return
    }
    if (session.rewardClaimed) {
      response.status(409).json({ status: 'error', message: 'Battle rewards have already been claimed' })
      return
    }
    const battle = battles.find((item) => item.id === session.battleId)
    if (!battle) {
      response.status(404).json({ status: 'error', message: 'Battle definition is no longer available' })
      return
    }

    let reward = { xpAwarded: 0, totalXP: null, nextBattleUnlocked: false, nextBattle: null }
    if (session.status === 'victory') {
      reward = await completeBattleProgress(request.user._id, battle, session.correctAnswers, battle.questions.length)
      const [gamification, streak] = await Promise.all([
        evaluateAndAwardBadges(request.user._id),
        recordQualifyingActivity(request.user._id),
      ])
      reward.newlyAwardedBadges = gamification.newlyAwarded
      reward.streak = streak
    }
    const claimed = await BattleSession.findOneAndUpdate(
      { _id: session._id, userId: request.user._id, rewardClaimed: false },
      { $set: { rewardClaimed: true, finishedAt: new Date() } },
      { returnDocument: 'after' },
    )
    if (!claimed) {
      response.status(409).json({ status: 'error', message: 'Battle rewards have already been claimed' })
      return
    }

    response.status(200).json({
      status: 'success',
      battleId: battle.id,
      result: session.status,
      victory: session.status === 'victory',
      questionsAnswered: session.answers.length,
      correctAnswers: session.correctAnswers,
      totalQuestions: battle.questions.length,
      xpAwarded: reward.xpAwarded,
      totalXP: reward.totalXP,
      nextBattleUnlocked: reward.nextBattleUnlocked,
      nextBattle: reward.nextBattle ? { id: reward.nextBattle.id, title: reward.nextBattle.title } : null,
      newlyAwardedBadges: reward.newlyAwardedBadges || [],
      streak: reward.streak || null,
      message: session.status === 'victory' ? 'Victory! The realm is defended.' : 'Battle lost. Regroup and try again.',
    })
  } catch (error) {
    response.status(error.status || 500).json({ status: 'error', message: error.status ? error.message : 'Unable to finish this battle right now' })
  }
}

async function getBattleHistory(request, response) {
  if (!databaseReady(response)) return
  try {
    const sessions = await BattleSession.find({
      userId: request.user._id,
      status: { $in: ['victory', 'defeat'] },
    })
      .sort({ createdAt: -1 })
      .limit(20)

    const history = sessions.map((s) => {
      const b = battles.find((item) => item.id === s.battleId)
      return {
        id: String(s._id),
        battleId: s.battleId,
        title: b?.title || 'Arena Challenge',
        domain: b?.domain || 'General Tech',
        difficulty: b?.difficulty || 'Intermediate',
        enemyName: b?.enemyName || 'Realm Guardian',
        status: s.status,
        score: `${s.correctAnswers}/${b?.questionCount || 5}`,
        correctAnswers: s.correctAnswers,
        totalQuestions: b?.questionCount || 5,
        xpEarned: s.status === 'victory' ? (b?.xpReward || 100) : 0,
        finishedAt: s.finishedAt || s.updatedAt || s.createdAt,
      }
    })

    response.status(200).json({ status: 'success', history })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load battle history' })
  }
}

async function getArenaStats(request, response) {
  if (!databaseReady(response)) return
  try {
    const sessions = await BattleSession.find({
      userId: request.user._id,
      status: { $in: ['victory', 'defeat'] },
    })

    const wins = sessions.filter((s) => s.status === 'victory').length
    const losses = sessions.filter((s) => s.status === 'defeat').length
    const total = wins + losses
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
    const arenaXP = sessions.filter((s) => s.status === 'victory').reduce((sum, s) => {
      const b = battles.find((item) => item.id === s.battleId)
      return sum + (b?.xpReward || 100)
    }, 0)

    const state = await getBattleState(request.user._id)

    response.status(200).json({
      status: 'success',
      stats: {
        totalBattles: total,
        wins,
        losses,
        winRate,
        arenaXP,
        totalXP: state?.totalXP ?? request.user.xp ?? 0,
        level: request.user.level || 1,
      },
    })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load arena stats' })
  }
}

module.exports = {
  listBattles,
  getBattle,
  startBattle,
  answerBattleQuestion,
  finishBattle,
  getBattleHistory,
  getArenaStats,
}
