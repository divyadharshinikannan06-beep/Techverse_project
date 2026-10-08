const mongoose = require('mongoose')
const { getProgressState, recordQuizPass, recordQuizAttempt, completeModuleProgress } = require('../services/progressService')
const { getQuizQuestions } = require('../data/quizQuestions')
const { evaluateAndAwardBadges } = require('../services/badgeService')
const { recordQualifyingActivity } = require('../services/streakService')

function findModule(state, moduleId) {
  for (const path of state.learningPath.paths) {
    const module = path.modules.find((candidate) => candidate.id === moduleId)
    if (module) return { module, path }
  }
  return null
}

async function submitQuiz(request, response) {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({ success: false, message: 'Quiz service is temporarily unavailable' })
    return
  }

  const { moduleId, answers } = request.body
  if (typeof moduleId !== 'string' || !moduleId.trim()) {
    response.status(400).json({ success: false, message: 'A moduleId is required' })
    return
  }
  if (!Array.isArray(answers)) {
    response.status(400).json({ success: false, message: 'Quiz answers must be an array' })
    return
  }

  try {
    const state = await getProgressState(request.user._id)
    if (!state) {
      response.status(404).json({ success: false, message: 'Complete your assessment before taking a quiz' })
      return
    }

    const match = findModule(state, moduleId)
    if (!match) {
      response.status(404).json({ success: false, message: 'Learning module not found' })
      return
    }
    if (match.module.status === 'completed') {
      response.status(409).json({ success: false, message: 'This module is already completed' })
      return
    }
    if (match.module.status !== 'unlocked') {
      response.status(423).json({ success: false, message: match.module.lockedReason || 'Complete the prerequisite module first' })
      return
    }

    const questions = getQuizQuestions(moduleId)
    if (questions.length === 0) {
      response.status(404).json({ success: false, message: 'No knowledge trial is available for this module' })
      return
    }
    if (answers.length !== questions.length) {
      response.status(400).json({ success: false, message: `Submit exactly ${questions.length} quiz answers` })
      return
    }

    const answerMap = new Map()
    for (const submitted of answers) {
      if (!submitted || typeof submitted.questionId !== 'string' || !Number.isInteger(submitted.answer) || submitted.answer < 0 || submitted.answer > 3) {
        response.status(400).json({ success: false, message: 'Each answer needs a questionId and an option index from 0 to 3' })
        return
      }
      if (answerMap.has(submitted.questionId)) {
        response.status(400).json({ success: false, message: 'Duplicate quiz answers are not allowed' })
        return
      }
      answerMap.set(submitted.questionId, submitted.answer)
    }

    const expectedIds = new Set(questions.map((question) => question.id))
    if (questions.some((question) => !answerMap.has(question.id)) || [...answerMap.keys()].some((questionId) => !expectedIds.has(questionId))) {
      response.status(400).json({ success: false, message: 'Quiz answers do not match this module' })
      return
    }

    const correctAnswers = questions.filter((question) => answerMap.get(question.id) === question.correctAnswer).length
    const incorrectAnswers = questions.length - correctAnswers
    const percentage = Math.round((correctAnswers / questions.length) * 100)
    const passed = percentage >= 70
    const explanations = questions.map((question) => ({
      questionId: question.id,
      submittedAnswer: answerMap.get(question.id),
      correctAnswer: question.correctAnswer,
      isCorrect: answerMap.get(question.id) === question.correctAnswer,
      explanation: question.explanation,
    }))

    if (!passed) {
      await recordQuizAttempt(request.user._id, moduleId, { percentage, correctAnswers, totalQuestions: questions.length, passed: false })
      response.status(200).json({
        success: true,
        moduleId,
        score: correctAnswers,
        totalQuestions: questions.length,
        correctAnswers,
        incorrectAnswers,
        percentage,
        passed: false,
        xpAwarded: 0,
        explanations,
      })
      return
    }

    await recordQuizAttempt(request.user._id, moduleId, { percentage, correctAnswers, totalQuestions: questions.length, passed: true })
    await recordQuizPass(request.user._id, moduleId, { percentage, correctAnswers, totalQuestions: questions.length })
    const completion = await completeModuleProgress(request.user._id, moduleId)
    const [gamification, streak] = await Promise.all([
      evaluateAndAwardBadges(request.user._id),
      recordQualifyingActivity(request.user._id),
    ])
    response.status(200).json({
      success: true,
      moduleId,
      score: correctAnswers,
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      percentage,
      passed: true,
      xpAwarded: completion.xpAwarded,
      explanations,
      progress: completion.progress,
      newlyUnlockedModules: completion.newlyUnlockedModules,
      newlyAwardedBadges: gamification.newlyAwarded,
      streak,
    })
  } catch (error) {
    response.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Unable to evaluate this knowledge trial right now',
    })
  }
}

module.exports = { submitQuiz }
