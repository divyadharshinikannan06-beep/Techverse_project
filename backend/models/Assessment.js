const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
)

const domainResultSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    recommendedModules: { type: [String], default: [] },
  },
  { _id: false },
)

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    answers: { type: [answerSchema], required: true },
    domainResults: { type: [domainResultSchema], required: true },
    strongestDomains: { type: [String], default: [] },
    weakestDomains: { type: [String], default: [] },
    recommendedDomains: { type: [String], default: [] },
    overallScore: { type: Number, required: true, min: 0 },
    overallTotal: { type: Number, required: true, min: 1 },
    overallPercentage: { type: Number, required: true, min: 0, max: 100 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Assessment', assessmentSchema)
