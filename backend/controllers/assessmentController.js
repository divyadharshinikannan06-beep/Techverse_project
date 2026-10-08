const mongoose = require('mongoose')
const Assessment = require('../models/Assessment')
const User = require('../models/User')
const { assessmentQuestions, domainModules } = require('../config/assessmentQuestions')

const domains = Object.keys(domainModules)

const ensureDatabaseReady = (response) => {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({
      status: 'error',
      message: 'MongoDB is not connected. Try again when the kingdom database is online.',
    })
    return false
  }

  return true
}

const getLevel = (percentage) => {
  if (percentage >= 70) return 'Advanced'
  if (percentage >= 40) return 'Intermediate'
  return 'Beginner'
}

const getAssessmentView = (assessment) => ({
  id: assessment._id,
  overallScore: assessment.overallScore,
  overallTotal: assessment.overallTotal,
  overallPercentage: assessment.overallPercentage,
  domainResults: assessment.domainResults,
  strongestDomains: assessment.strongestDomains,
  weakestDomains: assessment.weakestDomains,
  recommendedDomains: assessment.recommendedDomains,
  completedAt: assessment.completedAt,
})

const submitAssessment = async (request, response) => {
  try {
    if (!ensureDatabaseReady(response)) return

    const { answers } = request.body
    if (!Array.isArray(answers) || answers.length !== assessmentQuestions.length) {
      response.status(400).json({
        status: 'error',
        message: `Please submit exactly ${assessmentQuestions.length} assessment answers`,
      })
      return
    }

    const submitted = new Map()
    for (const answer of answers) {
      if (!answer || typeof answer.questionId !== 'string' || !Number.isInteger(answer.selectedIndex)) {
        response.status(400).json({ status: 'error', message: 'Each answer must include a questionId and selectedIndex' })
        return
      }
      if (submitted.has(answer.questionId)) {
        response.status(400).json({ status: 'error', message: 'Duplicate assessment answers are not allowed' })
        return
      }
      submitted.set(answer.questionId, answer.selectedIndex)
    }

    const domainScores = Object.fromEntries(domains.map((domain) => [domain, 0]))
    const storedAnswers = []

    for (const question of assessmentQuestions) {
      const selectedIndex = submitted.get(question.id)
      if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.options.length) {
        response.status(400).json({ status: 'error', message: 'Assessment contains an invalid answer' })
        return
      }

      const isCorrect = selectedIndex === question.correctIndex
      if (isCorrect) domainScores[question.domain] += 1
      storedAnswers.push({ questionId: question.id, selectedIndex, isCorrect })
    }

    const existingAssessment = await Assessment.findOne({ userId: request.user._id })
    if (existingAssessment) {
      response.status(409).json({ status: 'error', message: 'Your assessment has already been completed' })
      return
    }

    const domainResults = domains.map((domain) => {
      const total = assessmentQuestions.filter((question) => question.domain === domain).length
      const score = domainScores[domain]
      const percentage = Math.round((score / total) * 100)
      const level = getLevel(percentage)
      return { domain, score, total, percentage, level, recommendedModules: domainModules[domain].slice(level === 'Advanced' ? 1 : 0) }
    })

    const highest = Math.max(...domainResults.map((result) => result.percentage))
    const lowest = Math.min(...domainResults.map((result) => result.percentage))
    const recommendedDomains = [...domainResults]
      .sort((left, right) => left.percentage - right.percentage)
      .map((result) => result.domain)

    const assessment = await Assessment.create({
      userId: request.user._id,
      answers: storedAnswers,
      domainResults,
      strongestDomains: domainResults.filter((result) => result.percentage === highest).map((result) => result.domain),
      weakestDomains: domainResults.filter((result) => result.percentage === lowest).map((result) => result.domain),
      recommendedDomains,
      overallScore: domainResults.reduce((sum, result) => sum + result.score, 0),
      overallTotal: domainResults.reduce((sum, result) => sum + result.total, 0),
      overallPercentage: Math.round((domainResults.reduce((sum, result) => sum + result.score, 0) / assessmentQuestions.length) * 100),
    })

    await User.findByIdAndUpdate(request.user._id, { placementCompleted: true })

    response.status(201).json({ status: 'success', message: 'Assessment complete', assessment: getAssessmentView(assessment) })
  } catch (error) {
    if (error.code === 11000) {
      response.status(409).json({ status: 'error', message: 'Your assessment has already been completed' })
      return
    }
    response.status(500).json({ status: 'error', message: 'Unable to save your assessment right now' })
  }
}

const getMyAssessment = async (request, response) => {
  try {
    if (!ensureDatabaseReady(response)) return
    const assessment = await Assessment.findOne({ userId: request.user._id }).sort({ completedAt: -1 }).lean()
    if (!assessment) {
      response.status(404).json({ status: 'error', message: 'No completed assessment found' })
      return
    }
    response.status(200).json({ status: 'success', assessment: getAssessmentView(assessment) })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load your assessment right now' })
  }
}

module.exports = { submitAssessment, getMyAssessment }
