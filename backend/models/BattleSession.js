const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answerIndex: { type: Number, required: true, min: 0, max: 3 },
    correct: { type: Boolean, required: true },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const battleSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    battleId: { type: String, required: true },
    playerHp: { type: Number, required: true, min: 0, max: 100, default: 100 },
    enemyHp: { type: Number, required: true, min: 0, max: 100, default: 100 },
    correctAnswers: { type: Number, required: true, min: 0, default: 0 },
    questionIndex: { type: Number, required: true, min: 0, default: 0 },
    answers: { type: [answerSchema], default: [] },
    status: { type: String, enum: ['active', 'victory', 'defeat'], default: 'active' },
    rewardClaimed: { type: Boolean, default: false },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

module.exports = mongoose.model('BattleSession', battleSessionSchema)
