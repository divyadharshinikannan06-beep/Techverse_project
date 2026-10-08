const mongoose = require('mongoose')
const Progress = require('../models/Progress')
const { ensureProgress, getProgressState, completeModuleProgress } = require('../services/progressService')
const { evaluateAndAwardBadges } = require('../services/badgeService')
const { recordQualifyingActivity } = require('../services/streakService')

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true
  response.status(503).json({ status: 'error', message: 'Progress storage is temporarily unavailable' })
  return false
}

function findModule(state, moduleId) {
  for (const domainPath of state.learningPath.paths) {
    const module = domainPath.modules.find((candidate) => candidate.id === moduleId)
    if (module) return { module, domainPath }
  }
  return null
}

async function getMyProgress(request, response) {
  if (!databaseReady(response)) return
  try {
    const progress = await getProgressState(request.user._id)
    if (!progress) {
      response.status(404).json({ status: 'error', message: 'Complete your assessment before tracking module progress' })
      return
    }
    response.status(200).json({ status: 'success', progress })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load progress right now' })
  }
}

async function startModule(request, response) {
  if (!databaseReady(response)) return
  const { moduleId } = request.body
  if (typeof moduleId !== 'string' || !moduleId.trim()) {
    response.status(400).json({ status: 'error', message: 'A moduleId is required' })
    return
  }

  try {
    const state = await getProgressState(request.user._id)
    if (!state) {
      response.status(404).json({ status: 'error', message: 'Complete your assessment before starting a module' })
      return
    }
    const match = findModule(state, moduleId)
    if (!match) {
      response.status(404).json({ status: 'error', message: 'Learning module not found' })
      return
    }
    if (match.module.status === 'completed') {
      response.status(409).json({ status: 'error', message: 'This module is already completed' })
      return
    }
    if (match.module.status !== 'unlocked') {
      response.status(423).json({ status: 'error', message: match.module.lockedReason || 'Complete the prerequisite module first' })
      return
    }

    await ensureProgress(request.user._id)
    await Progress.updateOne(
      { userId: request.user._id },
      { $set: { currentModule: { moduleId, domain: match.domainPath.domain, startedAt: new Date() } } },
    )
    const updated = await getProgressState(request.user._id)
    response.status(200).json({ status: 'success', message: 'Module started', progress: updated, module: match.module })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to start this module right now' })
  }
}

async function completeModule(request, response) {
  if (!databaseReady(response)) return
  const { moduleId } = request.body
  if (typeof moduleId !== 'string' || !moduleId.trim()) {
    response.status(400).json({ status: 'error', message: 'A moduleId is required' })
    return
  }

  try {
    const result = await completeModuleProgress(request.user._id, moduleId)
    const [gamification, streak] = await Promise.all([
      evaluateAndAwardBadges(request.user._id),
      recordQualifyingActivity(request.user._id),
    ])
    response.status(200).json({ status: 'success', message: 'Module completed', ...result, newlyAwardedBadges: gamification.newlyAwarded, streak })
  } catch (error) {
    response.status(error.status || 500).json({ status: 'error', message: error.status ? error.message : 'Unable to complete this module right now' })
  }
}

module.exports = { getMyProgress, startModule, completeModule }
