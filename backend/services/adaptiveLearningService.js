const Assessment = require('../models/Assessment')
const BattleSession = require('../models/BattleSession')
const Progress = require('../models/Progress')
const { challenges } = require('../data/codingChallenges')
const { getBattleState, getCodingChallengeState, getProgressState } = require('./progressService')
const { getStreak } = require('./streakService')
const { generateLearningRecommendation, generateStudyPlan } = require('./aiService')

const levels = ['Beginner', 'Intermediate', 'Advanced']

function emptyDomain(domain) {
  return { domain, assessmentPercentage: 0, level: 'Beginner', quizAttempts: 0, quizFailures: 0, quizAverage: null, codingAttempts: 0, codingFailures: 0, codingCompleted: 0, battleVictories: 0, battleDefeats: 0, priorityScore: 0 }
}

function getDifficulty(profile, activity) {
  const repeatedFailures = profile.summary.quiz.failures >= 2 || profile.summary.coding.failures >= 2 || profile.summary.battles.defeats >= 2
  if (repeatedFailures) return 'Beginner'
  const successes = profile.summary.quiz.passed + profile.summary.coding.completed + profile.summary.battles.victories
  const attempts = profile.summary.quiz.attempts + profile.summary.coding.attempts + profile.summary.battles.victories + profile.summary.battles.defeats
  if (attempts > 0 && successes / attempts >= 0.8 && profile.domains.find((domain) => domain.domain === profile.recommendedDomain)?.assessmentPercentage >= 70) return 'Advanced'
  return activity?.difficulty || 'Intermediate'
}

function buildReason(domain) {
  const evidence = []
  if (domain.assessmentPercentage < 70) evidence.push(`${domain.assessmentPercentage}% placement result`)
  if (domain.quizFailures) evidence.push(`${domain.quizFailures} quiz failure${domain.quizFailures === 1 ? '' : 's'}`)
  if (domain.codingFailures) evidence.push(`${domain.codingFailures} coding failure${domain.codingFailures === 1 ? '' : 's'}`)
  if (domain.battleDefeats) evidence.push(`${domain.battleDefeats} Battle Arena defeat${domain.battleDefeats === 1 ? '' : 's'}`)
  if (!evidence.length) return `Your ${domain.domain} activity is ready for the next measured step.`
  return `Prioritized because your ${domain.domain} record shows ${evidence.join(', ')}.`
}

function getFocusAreas(domain) {
  const focusAreas = []
  if (domain.assessmentPercentage < 70) focusAreas.push(`${domain.domain} fundamentals`)
  if (domain.quizFailures) focusAreas.push(`${domain.domain} quiz review`)
  if (domain.codingFailures) focusAreas.push(`${domain.domain} coding practice`)
  if (domain.battleDefeats) focusAreas.push(`${domain.domain} battle concepts`)
  return focusAreas.length ? focusAreas : [`Continue ${domain.domain} with a harder challenge`]
}

async function buildAdaptiveProfile(userId) {
  const [assessment, progress, progressState, codingState, battleState, battleSessions, streak] = await Promise.all([
    Assessment.findOne({ userId }).sort({ completedAt: -1 }).lean(),
    Progress.findOne({ userId }).lean(),
    getProgressState(userId),
    getCodingChallengeState(userId),
    getBattleState(userId),
    BattleSession.find({ userId }, { battleId: 1, status: 1, createdAt: 1, updatedAt: 1 }).lean(),
    getStreak(userId),
  ])

  const domainResults = assessment?.domainResults || []
  const domainsByName = new Map(domainResults.map((result) => [result.domain, { ...emptyDomain(result.domain), assessmentPercentage: result.percentage, level: result.level }]))
  const ensureDomain = (domain) => {
    if (!domainsByName.has(domain)) domainsByName.set(domain, emptyDomain(domain))
    return domainsByName.get(domain)
  }
  const moduleDomain = new Map((progressState?.learningPath?.paths || []).flatMap((path) => path.modules.map((module) => [module.id, path.domain])))
  const challengeDomain = new Map(challenges.map((challenge) => [challenge.id, challenge.domain]))
  const battleDomain = new Map((battleState?.battles || []).map((battle) => [battle.id, battle.domain]))

  for (const attempt of progress?.quizAttempts || []) {
    const domain = ensureDomain(moduleDomain.get(attempt.moduleId) || 'General Learning')
    domain.quizAttempts += 1
    if (!attempt.passed) domain.quizFailures += 1
    domain.quizAverage = domain.quizAverage === null ? attempt.percentage : Math.round(((domain.quizAverage * (domain.quizAttempts - 1)) + attempt.percentage) / domain.quizAttempts)
  }
  for (const completed of progress?.completedChallenges || []) ensureDomain(challengeDomain.get(completed.challengeId) || completed.domain || 'General Learning').codingCompleted += 1
  for (const attempt of progress?.codingAttempts || []) {
    const domain = ensureDomain(challengeDomain.get(attempt.challengeId) || 'General Learning')
    domain.codingAttempts += attempt.attempts || 0
    domain.codingFailures += attempt.attempts || 0
  }
  for (const battle of progress?.completedBattles || []) ensureDomain(battleDomain.get(battle.battleId) || battle.domain).battleVictories += 1
  for (const session of battleSessions) {
    const domain = ensureDomain(battleDomain.get(session.battleId) || 'General Learning')
    if (session.status === 'defeat') domain.battleDefeats += 1
  }

  const domainList = [...domainsByName.values()].map((domain) => {
    const weakness = (100 - domain.assessmentPercentage) * 0.55
    const quizPenalty = domain.quizFailures * 12
    const codingPenalty = domain.codingFailures * 6
    const battlePenalty = domain.battleDefeats * 6
    const successReduction = Math.min(18, (domain.codingCompleted + domain.battleVictories) * 3)
    return { ...domain, priorityScore: Math.max(0, Math.round(weakness + quizPenalty + codingPenalty + battlePenalty - successReduction)) }
  })
  const strongest = [...domainList].sort((left, right) => right.assessmentPercentage - left.assessmentPercentage)[0] || null
  const recommendedDomain = [...domainList].sort((left, right) => right.priorityScore - left.priorityScore || left.assessmentPercentage - right.assessmentPercentage)[0] || strongest

  const paths = progressState?.learningPath?.paths || []
  const recommendedPath = paths.find((path) => path.domain === recommendedDomain?.domain)
  const unlockedModule = recommendedPath?.modules.find((module) => module.status === 'unlocked') || paths.flatMap((path) => path.modules).find((module) => module.status === 'unlocked')
  const unlockedChallenge = codingState?.challenges?.find((challenge) => challenge.status === 'unlocked')
  const unlockedBattle = battleState?.battles?.find((battle) => battle.status === 'unlocked')
  const chosenActivity = unlockedModule
    ? { type: 'module', id: unlockedModule.id, title: unlockedModule.title, domain: unlockedModule.domain, difficulty: unlockedModule.difficulty, route: `/learn/${unlockedModule.id}`, status: unlockedModule.status }
    : unlockedChallenge
      ? { type: 'coding', id: unlockedChallenge.id, title: unlockedChallenge.title, domain: unlockedChallenge.domain, difficulty: unlockedChallenge.difficulty, route: `/coding/${unlockedChallenge.id}`, status: unlockedChallenge.status }
      : unlockedBattle
        ? { type: 'battle', id: unlockedBattle.id, title: unlockedBattle.title, domain: unlockedBattle.domain, difficulty: unlockedBattle.difficulty, route: `/battle/${unlockedBattle.id}`, status: unlockedBattle.status }
        : null

  const profile = {
    hasAssessment: Boolean(assessment),
    strongestDomain: strongest?.domain || null,
    weakestDomain: [...domainList].sort((left, right) => left.assessmentPercentage - right.assessmentPercentage)[0]?.domain || null,
    recommendedDomain: recommendedDomain?.domain || null,
    difficulty: getDifficulty({ summary: { quiz: { failures: (progress?.quizAttempts || []).filter((attempt) => !attempt.passed).length, passed: (progress?.quizAttempts || []).filter((attempt) => attempt.passed).length, attempts: progress?.quizAttempts?.length || 0 }, coding: { failures: progress?.codingAttempts?.reduce((sum, attempt) => sum + (attempt.attempts || 0), 0) || 0, completed: progress?.completedChallenges?.length || 0, attempts: (progress?.codingAttempts || []).reduce((sum, attempt) => sum + (attempt.attempts || 0), 0) + (progress?.completedChallenges?.length || 0) }, battles: { defeats: (battleSessions || []).filter((session) => session.status === 'defeat').length, victories: progress?.completedBattles?.length || 0 } }, domains: domainList, recommendedDomain: recommendedDomain?.domain }, chosenActivity),
    recommendedActivity: chosenActivity,
    reason: buildReason(recommendedDomain || emptyDomain('your next domain')),
    focusAreas: getFocusAreas(recommendedDomain || emptyDomain('your next domain')),
    domains: domainList,
    streak,
    summary: {
      totalXP: progress?.totalXP || 0,
      completedModules: progress?.completedModules?.length || 0,
      quiz: { attempts: progress?.quizAttempts?.length || 0, failures: (progress?.quizAttempts || []).filter((attempt) => !attempt.passed).length, passed: (progress?.quizAttempts || []).filter((attempt) => attempt.passed).length },
      coding: { attempts: (progress?.codingAttempts || []).reduce((sum, attempt) => sum + (attempt.attempts || 0), 0), failures: (progress?.codingAttempts || []).reduce((sum, attempt) => sum + (attempt.attempts || 0), 0), completed: progress?.completedChallenges?.length || 0 },
      battles: { victories: progress?.completedBattles?.length || 0, defeats: (battleSessions || []).filter((session) => session.status === 'defeat').length },
      recentActivity: (progress?.activityDates || []).slice(-14),
    },
  }
  const recommendation = await generateLearningRecommendation(profile)
  const studyPlan = await generateStudyPlan(profile)
  return { ...profile, ...recommendation, studyPlan }
}

module.exports = { buildAdaptiveProfile }
