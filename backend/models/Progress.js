const mongoose = require('mongoose')

const completedModuleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true },
    domain: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    xpEarned: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const currentModuleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true },
    domain: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const quizPassSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true },
    percentage: { type: Number, required: true, min: 70, max: 100 },
    correctAnswers: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    passedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const quizAttemptSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    correctAnswers: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    passed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const completedChallengeSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true },
    moduleId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    xpEarned: { type: Number, required: true, min: 0 },
    language: { type: String, enum: ['python', 'javascript'], required: true },
    testsPassed: { type: Number, required: true, min: 0 },
    totalTests: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const codingAttemptSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true },
    attempts: { type: Number, required: true, min: 1, default: 1 },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const completedBattleSchema = new mongoose.Schema(
  {
    battleId: { type: String, required: true },
    domain: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    xpEarned: { type: Number, required: true, min: 0 },
    correctAnswers: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const earnedBadgeSchema = new mongoose.Schema(
  {
    badgeId: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    completedModules: { type: [completedModuleSchema], default: [] },
    passedQuizzes: { type: [quizPassSchema], default: [] },
    quizAttempts: { type: [quizAttemptSchema], default: [] },
    completedChallenges: { type: [completedChallengeSchema], default: [] },
    codingAttempts: { type: [codingAttemptSchema], default: [] },
    completedBattles: { type: [completedBattleSchema], default: [] },
    quizPassCount: { type: Number, default: 0, min: 0 },
    earnedBadges: { type: [earnedBadgeSchema], default: [] },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActivityDate: { type: String, default: null },
    streakUpdatedAt: { type: Date, default: null },
    activityDates: { type: [String], default: [] },
    currentModule: { type: currentModuleSchema, default: null },
    totalXP: { type: Number, default: 0, min: 0 },
    completedModuleCount: { type: Number, default: 0, min: 0 },
    lastCompletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Progress', progressSchema)
