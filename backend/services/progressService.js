const Assessment = require('../models/Assessment')
const Progress = require('../models/Progress')
const { buildLearningPath } = require('./learningPathService')
const { challenges } = require('../data/codingChallenges')
const { battles } = require('../data/battles')

async function getProgressState(userId) {
  const assessment = await Assessment.findOne({ userId }).sort({ completedAt: -1 }).lean()
  if (!assessment) return null

  const progress = await Progress.findOne({ userId }).lean()
  const learningPath = buildLearningPath(assessment)
  const completedRecords = progress?.completedModules || []
  const completedIds = new Set(completedRecords.map((module) => module.moduleId))
  const domainProgress = []

  learningPath.paths = learningPath.paths.map((domainPath) => {
    const assessmentCredits = new Set(domainPath.modules.filter((module) => module.status === 'available').map((module) => module.id))
    let previousModuleCompleted = true
    const modules = domainPath.modules.map((module) => {
      const completedRecord = completedRecords.find((record) => record.moduleId === module.id)
      const assessmentCredit = !completedRecord && assessmentCredits.has(module.id)
      const completed = Boolean(completedRecord || assessmentCredit)
      const status = completed ? 'completed' : previousModuleCompleted ? 'unlocked' : 'locked'
      const reason = status === 'locked'
        ? `Complete ${domainPath.modules[domainPath.modules.indexOf(module) - 1]?.title || 'the previous mission'} to unlock this module.`
        : ''

      previousModuleCompleted = completed
      return {
        ...module,
        domain: domainPath.domain,
        prerequisite: domainPath.modules[domainPath.modules.indexOf(module) - 1]?.id || null,
        status,
        unlocked: status !== 'locked',
        completed,
        assessmentCredit,
        completedAt: completedRecord?.completedAt || null,
        xpEarned: completedRecord?.xpEarned || 0,
        lockedReason: reason,
      }
    })

    const earnedCount = modules.filter((module) => completedIds.has(module.id)).length
    const currentModuleId = modules.find((module) => module.status === 'unlocked')?.id || null
    const totalAvailableXp = modules.filter((module) => module.status === 'unlocked').reduce((sum, module) => sum + module.xp, 0)
    domainProgress.push({ domain: domainPath.domain, completed: earnedCount, total: modules.length, percentage: modules.length ? Math.round((earnedCount / modules.length) * 100) : 0 })

    return {
      ...domainPath,
      modules,
      completedModules: modules.filter((module) => completedIds.has(module.id)).map((module) => module.id),
      completedModuleCount: earnedCount,
      currentModuleId,
      progressPercentage: modules.length ? Math.round((earnedCount / modules.length) * 100) : 0,
      totalAvailableXp,
    }
  })

  const allModules = learningPath.paths.flatMap((domainPath) => domainPath.modules)
  const totalAccessibleModules = allModules.filter((module) => module.status !== 'locked').length
  const completedModuleCount = completedRecords.length
  const currentModuleRecord = progress?.currentModule
  const currentModule = currentModuleRecord
    ? allModules.find((module) => module.id === currentModuleRecord.moduleId && module.status === 'unlocked')
    : null
  const nextModule = currentModule || learningPath.paths.flatMap((domainPath) => domainPath.modules).find((module) => module.status === 'unlocked') || null

  return {
    userId: String(userId),
    totalXP: progress?.totalXP || 0,
    completedModuleCount,
    completedModules: completedRecords,
    currentModule: nextModule ? { moduleId: nextModule.id, title: nextModule.title, domain: nextModule.domain, level: nextModule.level } : null,
    lastCompletedAt: progress?.lastCompletedAt || null,
    overallProgress: totalAccessibleModules ? Math.round((completedModuleCount / totalAccessibleModules) * 100) : 0,
    totalAccessibleModules,
    domainProgress,
    learningPath,
  }
}

async function ensureProgress(userId) {
  return Progress.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, completedModules: [], totalXP: 0, completedModuleCount: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
}

function progressError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function findPathModule(state, moduleId) {
  for (const domainPath of state.learningPath.paths) {
    const module = domainPath.modules.find((candidate) => candidate.id === moduleId)
    if (module) return { module, domainPath }
  }
  return null
}

async function recordQuizPass(userId, moduleId, result) {
  const state = await getProgressState(userId)
  if (!state) throw progressError(404, 'Complete your assessment before taking a module quiz')
  const match = findPathModule(state, moduleId)
  if (!match) throw progressError(404, 'Learning module not found')
  if (match.module.status === 'completed') throw progressError(409, 'This module is already completed')
  if (match.module.status !== 'unlocked') throw progressError(423, match.module.lockedReason || 'Complete the prerequisite module first')

  await ensureProgress(userId)
  await Progress.updateOne(
    { userId, 'passedQuizzes.moduleId': { $ne: moduleId } },
    {
      $push: { passedQuizzes: { moduleId, percentage: result.percentage, correctAnswers: result.correctAnswers, totalQuestions: result.totalQuestions, passedAt: new Date() } },
      $inc: { quizPassCount: 1 },
    },
  )
}

async function recordQuizAttempt(userId, moduleId, result) {
  await ensureProgress(userId)
  return Progress.updateOne(
    { userId },
    { $push: { quizAttempts: { moduleId, percentage: result.percentage, correctAnswers: result.correctAnswers, totalQuestions: result.totalQuestions, passed: result.passed, attemptedAt: new Date() } } },
  )
}

async function completeModuleProgress(userId, moduleId) {
  const before = await getProgressState(userId)
  if (!before) throw progressError(404, 'Complete your assessment before completing a module')
  const match = findPathModule(before, moduleId)
  if (!match) throw progressError(404, 'Learning module not found')
  if (match.module.status === 'completed') throw progressError(409, 'This module has already been completed')
  if (match.module.status !== 'unlocked') throw progressError(423, match.module.lockedReason || 'Complete the prerequisite module first')

  const savedProgress = await Progress.findOne({ userId }).lean()
  if (!savedProgress?.passedQuizzes?.some((quiz) => quiz.moduleId === moduleId && quiz.percentage >= 70)) {
    throw progressError(403, 'Pass this module knowledge trial before claiming its reward')
  }

  await ensureProgress(userId)
  const completedAt = new Date()
  const updatedRecord = await Progress.findOneAndUpdate(
    { userId, 'passedQuizzes.moduleId': moduleId, 'completedModules.moduleId': { $ne: moduleId } },
    {
      $push: { completedModules: { moduleId, domain: match.domainPath.domain, completedAt, xpEarned: match.module.xp } },
      $inc: { totalXP: match.module.xp, completedModuleCount: 1 },
      $set: { lastCompletedAt: completedAt, currentModule: null },
      $pull: { passedQuizzes: { moduleId } },
    },
    { new: true, runValidators: true },
  )

  if (!updatedRecord) {
    const latest = await Progress.findOne({ userId }).lean()
    if (latest?.completedModules?.some((module) => module.moduleId === moduleId)) {
      throw progressError(409, 'This module has already been completed')
    }
    throw progressError(403, 'Pass this module knowledge trial before claiming its reward')
  }

  const after = await getProgressState(userId)
  const previouslyUnavailable = new Set(before.learningPath.paths.flatMap((path) => path.modules.filter((module) => module.status !== 'unlocked').map((module) => module.id)))
  const newlyUnlockedModules = after.learningPath.paths.flatMap((path) => path.modules
    .filter((module) => module.status === 'unlocked' && previouslyUnavailable.has(module.id))
    .map((module) => ({ moduleId: module.id, domain: path.domain, title: module.title, xp: module.xp })))
  const current = after.currentModule

  if (current) {
    const startedAt = new Date()
    await Progress.updateOne(
      { userId },
      { $set: { currentModule: { moduleId: current.moduleId, domain: current.domain, startedAt } } },
    )
    after.currentModule.startedAt = startedAt
  }

  return { xpAwarded: match.module.xp, progress: after, newlyUnlockedModules }
}

async function getCodingChallengeState(userId) {
  const state = await getProgressState(userId)
  if (!state) return null
  const progress = await Progress.findOne({ userId }).lean()
  const completed = progress?.completedChallenges || []
  const attempts = progress?.codingAttempts || []
  const completedModuleIds = new Set((progress?.completedModules || []).map((record) => record.moduleId))
  const completedIds = new Set(completed.map((record) => record.challengeId))
  const pathsByModule = new Map(state.learningPath.paths.flatMap((path) => path.modules.map((module) => [module.id, module])))
  const challengesByDomain = new Map()

  for (const challenge of challenges) {
    const linkedModule = pathsByModule.get(challenge.moduleId)
    if (!linkedModule) continue
    const group = challengesByDomain.get(challenge.domain) || []
    group.push({ challenge, linkedModule })
    challengesByDomain.set(challenge.domain, group)
  }

  const challengeStates = []
  for (const [domain, entries] of challengesByDomain) {
    entries.sort((left, right) => left.challenge.order - right.challenge.order)
    const domainPath = state.learningPath.paths.find((path) => path.domain === domain)
    const gateModule = domainPath?.modules.find((module) => !module.assessmentCredit)
    let previousChallengeCompleted = true
    for (const { challenge, linkedModule } of entries) {
      const record = completed.find((item) => item.challengeId === challenge.id)
      const attemptRecord = attempts.find((item) => item.challengeId === challenge.id)
      const available = Boolean(gateModule && completedModuleIds.has(gateModule.id))
      const unlocked = !record && available && previousChallengeCompleted
      const status = record ? 'completed' : unlocked ? 'unlocked' : 'locked'
      const previous = entries[entries.findIndex((entry) => entry.challenge.id === challenge.id) - 1]?.challenge
      challengeStates.push({
        id: challenge.id,
        moduleId: challenge.moduleId,
        requiredModuleId: gateModule?.id || linkedModule?.id || challenge.moduleId,
        requiredModuleTitle: gateModule?.title || linkedModule?.title || challenge.moduleId,
        domain,
        title: challenge.title,
        difficulty: challenge.difficulty,
        xp: challenge.xp,
        order: challenge.order,
        status,
        completed: Boolean(record),
        completedAt: record?.completedAt || null,
        xpEarned: record?.xpEarned || 0,
        attempted: Boolean(attemptRecord),
        attemptCount: attemptRecord?.attempts || 0,
        lockedReason: status === 'locked'
          ? !gateModule || !completedModuleIds.has(gateModule.id) ? `Complete ${gateModule?.title || linkedModule.title} before entering this coding quest.` : `Complete ${previous?.title || 'the previous coding quest'} first.`
          : '',
      })
      previousChallengeCompleted = Boolean(record)
    }
  }

  const domainPriority = new Map(state.learningPath.paths.map((path, index) => [path.domain, index]))
  challengeStates.sort((left, right) => {
    const priorityDifference = (domainPriority.get(left.domain) ?? Number.MAX_SAFE_INTEGER) - (domainPriority.get(right.domain) ?? Number.MAX_SAFE_INTEGER)
    return priorityDifference || left.order - right.order
  })

  return { challenges: challengeStates, completedChallenges: completed, totalXP: progress?.totalXP || 0 }
}

async function completeCodingChallenge(userId, challenge, language, testsPassed, totalTests) {
  const state = await getProgressState(userId)
  if (!state) throw progressError(404, 'Complete your assessment before entering coding quests')
  const codingState = await getCodingChallengeState(userId)
  const current = codingState?.challenges.find((item) => item.id === challenge.id)
  if (!current) throw progressError(404, 'Coding challenge not found in your learning path')
  if (current.status === 'completed') throw progressError(409, 'Challenge already completed.')
  if (current.status !== 'unlocked') throw progressError(423, current.lockedReason || 'Complete the previous coding quest first.')
  const module = findPathModule(state, current.requiredModuleId)
  if (!module || module.module.status !== 'completed' || module.module.assessmentCredit) {
    throw progressError(423, `Complete ${module?.module.title || 'the current learning module'} before entering this coding quest.`)
  }

  await ensureProgress(userId)
  const completedAt = new Date()
  const updated = await Progress.findOneAndUpdate(
    { userId, 'completedChallenges.challengeId': { $ne: challenge.id } },
    {
      $push: { completedChallenges: { challengeId: challenge.id, moduleId: challenge.moduleId, completedAt, xpEarned: challenge.xp, language, testsPassed, totalTests } },
      $inc: { totalXP: challenge.xp },
    },
    { returnDocument: 'after', runValidators: true },
  )
  if (!updated) throw progressError(409, 'Challenge already completed.')
  const refreshed = await getCodingChallengeState(userId)
  const nextChallenge = refreshed.challenges.find((item) => item.domain === challenge.domain && item.order > challenge.order && item.status === 'unlocked') || null
  return { xpAwarded: challenge.xp, totalXP: updated.totalXP, nextChallengeUnlocked: Boolean(nextChallenge), nextChallenge }
}

async function recordCodingAttempt(userId, challengeId) {
  await ensureProgress(userId)
  const lastAttemptAt = new Date()
  const updated = await Progress.findOneAndUpdate(
    { userId, 'codingAttempts.challengeId': challengeId },
    { $inc: { 'codingAttempts.$.attempts': 1 }, $set: { 'codingAttempts.$.lastAttemptAt': lastAttemptAt } },
    { returnDocument: 'after' },
  )
  if (updated) return updated

  const inserted = await Progress.findOneAndUpdate(
    { userId, 'codingAttempts.challengeId': { $ne: challengeId } },
    { $push: { codingAttempts: { challengeId, attempts: 1, lastAttemptAt } } },
    { returnDocument: 'after' },
  )
  if (inserted) return inserted

  return Progress.findOneAndUpdate(
    { userId, 'codingAttempts.challengeId': challengeId },
    { $inc: { 'codingAttempts.$.attempts': 1 }, $set: { 'codingAttempts.$.lastAttemptAt': new Date() } },
    { returnDocument: 'after' },
  )
}

async function getBattleState(userId) {
  const state = await getProgressState(userId)
  if (!state) return null
  const progress = await Progress.findOne({ userId }).lean()
  const completedBattles = progress?.completedBattles || []
  const completedModuleIds = new Set((progress?.completedModules || []).map((record) => record.moduleId))
  const battleStates = []

  for (const domainPath of state.learningPath.paths) {
    const domainBattles = battles.filter((battle) => battle.domain === domainPath.domain).sort((left, right) => left.order - right.order)
    const gateModule = domainPath.modules.find((module) => !module.assessmentCredit)
    let previousBattleCompleted = true
    for (const battle of domainBattles) {
      const completion = completedBattles.find((item) => item.battleId === battle.id)
      const gateComplete = Boolean(gateModule && completedModuleIds.has(gateModule.id))
      const unlocked = !completion && gateComplete && previousBattleCompleted
      const status = completion ? 'completed' : unlocked ? 'unlocked' : 'locked'
      const previous = domainBattles[battle.order - 2]
      battleStates.push({
        id: battle.id,
        domain: battle.domain,
        title: battle.title,
        enemyName: battle.enemyName,
        enemyType: battle.enemyType,
        difficulty: battle.difficulty,
        questionCount: battle.questionCount,
        xpReward: battle.xpReward,
        order: battle.order,
        status,
        completedAt: completion?.completedAt || null,
        xpEarned: completion?.xpEarned || 0,
        correctAnswers: completion?.correctAnswers || 0,
        lockedReason: status === 'locked'
          ? !gateComplete ? `Complete ${gateModule?.title || 'your domain learning mission'} before entering this battle.` : `Win ${previous?.title || 'the previous battle'} first.`
          : '',
      })
      previousBattleCompleted = Boolean(completion)
    }
  }

  const domainPriority = new Map(state.learningPath.paths.map((path, index) => [path.domain, index]))
  battleStates.sort((left, right) => {
    const priorityDifference = (domainPriority.get(left.domain) ?? Number.MAX_SAFE_INTEGER) - (domainPriority.get(right.domain) ?? Number.MAX_SAFE_INTEGER)
    return priorityDifference || left.order - right.order
  })
  return { battles: battleStates, totalXP: progress?.totalXP || 0 }
}

async function completeBattleProgress(userId, battle, correctAnswers, totalQuestions) {
  const before = await getBattleState(userId)
  if (!before) throw progressError(404, 'Complete your assessment before entering the Battle Arena')
  const current = before.battles.find((item) => item.id === battle.id)
  if (!current) throw progressError(404, 'Battle not found in your learning path')
  if (current.status === 'completed') throw progressError(409, 'This battle is already complete')
  if (current.status !== 'unlocked') throw progressError(423, current.lockedReason || 'Complete the prerequisite mission first')

  await ensureProgress(userId)
  const completedAt = new Date()
  const updated = await Progress.findOneAndUpdate(
    { userId, 'completedBattles.battleId': { $ne: battle.id } },
    {
      $push: { completedBattles: { battleId: battle.id, domain: battle.domain, completedAt, xpEarned: battle.xpReward, correctAnswers, totalQuestions } },
      $inc: { totalXP: battle.xpReward },
    },
    { returnDocument: 'after', runValidators: true },
  )
  if (!updated) throw progressError(409, 'This battle is already complete')

  const after = await getBattleState(userId)
  const nextBattle = after.battles.find((item) => item.domain === battle.domain && item.order > battle.order && item.status === 'unlocked') || null
  return { xpAwarded: battle.xpReward, totalXP: updated.totalXP, nextBattleUnlocked: Boolean(nextBattle), nextBattle }
}

module.exports = { getProgressState, ensureProgress, recordQuizPass, recordQuizAttempt, completeModuleProgress, getCodingChallengeState, completeCodingChallenge, recordCodingAttempt, getBattleState, completeBattleProgress }
