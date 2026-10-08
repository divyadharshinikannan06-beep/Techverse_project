const mongoose = require('mongoose')
const { completeCodingChallenge, getCodingChallengeState, recordCodingAttempt } = require('../services/progressService')
const { getChallenge, getPublicChallenge, validateChallengeSource } = require('../services/codingService')
const { evaluateAndAwardBadges } = require('../services/badgeService')
const { recordQualifyingActivity } = require('../services/streakService')

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true
  response.status(503).json({ success: false, message: 'Coding quests are temporarily unavailable' })
  return false
}

function findChallengeState(state, challengeId) {
  return state?.challenges.find((challenge) => challenge.id === challengeId) || null
}

async function getCodingChallenges(request, response) {
  if (!databaseReady(response)) return
  try {
    const state = await getCodingChallengeState(request.user._id)
    if (!state) {
      response.status(404).json({ success: false, message: 'Complete your assessment to reveal coding quests' })
      return
    }
    const challenges = state.challenges.map((challengeState) => {
      const challenge = getChallenge(challengeState.id)
      return { ...getPublicChallenge(challenge), ...challengeState }
    })
    response.status(200).json({ success: true, challenges, totalXP: state.totalXP })
  } catch (error) {
    response.status(500).json({ success: false, message: 'Unable to load coding quests right now' })
  }
}

async function getCodingChallenge(request, response) {
  if (!databaseReady(response)) return
  try {
    const challenge = getChallenge(request.params.challengeId)
    if (!challenge) {
      response.status(404).json({ success: false, message: 'Coding challenge not found' })
      return
    }
    const state = await getCodingChallengeState(request.user._id)
    if (!state) {
      response.status(404).json({ success: false, message: 'Complete your assessment to reveal coding quests' })
      return
    }
    const challengeState = findChallengeState(state, challenge.id)
    if (!challengeState) {
      response.status(404).json({ success: false, message: 'Challenge is not part of your learning path' })
      return
    }
    response.status(200).json({ success: true, challenge: { ...getPublicChallenge(challenge), ...challengeState } })
  } catch (error) {
    response.status(500).json({ success: false, message: 'Unable to load this coding quest right now' })
  }
}

async function evaluateSubmission(request, response, awardXP) {
  if (!databaseReady(response)) return
  const { challengeId, language, code } = request.body || {}
  if (typeof challengeId !== 'string' || !challengeId.trim()) {
    response.status(400).json({ success: false, message: 'A challengeId is required' })
    return
  }
  if (typeof language !== 'string' || !['python', 'javascript'].includes(language)) {
    response.status(400).json({ success: false, message: 'Choose Python or JavaScript' })
    return
  }
  if (typeof code !== 'string' || !code.trim()) {
    response.status(400).json({ success: false, message: 'Write a solution before running this quest' })
    return
  }
  if (code.length > 20000) {
    response.status(413).json({ success: false, message: 'Solution is too large. Keep submissions under 20,000 characters.' })
    return
  }

  try {
    const challenge = getChallenge(challengeId)
    if (!challenge) {
      response.status(404).json({ success: false, message: 'Coding challenge not found' })
      return
    }
    if (!challenge.supportedLanguages.includes(language)) {
      response.status(400).json({ success: false, message: 'This challenge does not support the selected language' })
      return
    }

    const state = await getCodingChallengeState(request.user._id)
    if (!state) {
      response.status(404).json({ success: false, message: 'Complete your assessment to reveal coding quests' })
      return
    }
    const challengeState = findChallengeState(state, challengeId)
    if (!challengeState) {
      response.status(404).json({ success: false, message: 'Challenge is not part of your learning path' })
      return
    }
    if (challengeState.status === 'completed') {
      response.status(409).json({ success: false, message: 'Challenge already completed.' })
      return
    }
    if (challengeState.status !== 'unlocked') {
      response.status(423).json({ success: false, message: challengeState.lockedReason || 'Complete the previous coding quest first' })
      return
    }

    const evaluation = validateChallengeSource(challenge, language, code)
    const passed = evaluation.totalTests > 0 && evaluation.testsPassed === evaluation.totalTests
    const resultBase = {
      success: true,
      challengeId,
      passed,
      testsPassed: evaluation.testsPassed,
      totalTests: evaluation.totalTests,
      checkResults: evaluation.checks.map((check, index) => ({ test: index + 1, passed: check.passed })),
    }

    if (!awardXP) {
      response.status(200).json({
        ...resultBase,
        xpAwarded: 0,
        message: passed ? 'All static solution checks passed. Submit to claim this quest.' : 'Some static solution checks failed.',
      })
      return
    }

    if (!passed) {
      if (awardXP) await recordCodingAttempt(request.user._id, challengeId)
      response.status(200).json({ ...resultBase, xpAwarded: 0, message: 'Some solution checks failed. Review the hints and retry.' })
      return
    }

    const completion = await completeCodingChallenge(request.user._id, challenge, language, evaluation.testsPassed, evaluation.totalTests)
    const [gamification, streak] = await Promise.all([
      evaluateAndAwardBadges(request.user._id),
      recordQualifyingActivity(request.user._id),
    ])
    response.status(200).json({
      ...resultBase,
      xpAwarded: completion.xpAwarded,
      totalXP: completion.totalXP,
      nextChallengeUnlocked: completion.nextChallengeUnlocked,
      nextChallenge: completion.nextChallenge ? { id: completion.nextChallenge.id, title: completion.nextChallenge.title } : null,
      newlyAwardedBadges: gamification.newlyAwarded,
      streak,
      message: 'Coding challenge completed.',
    })
  } catch (error) {
    response.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Unable to validate this coding quest right now' })
  }
}

async function runSubmission(request, response) {
  return evaluateSubmission(request, response, false)
}

async function submitCodingChallenge(request, response) {
  return evaluateSubmission(request, response, true)
}

module.exports = { getCodingChallenges, getCodingChallenge, runSubmission, submitCodingChallenge }
