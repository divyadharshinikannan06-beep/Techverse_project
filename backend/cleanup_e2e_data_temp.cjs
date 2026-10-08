require('dotenv').config({ path: 'backend/.env' })
const mongoose = require('mongoose')
const User = require('./models/User')
const Assessment = require('./models/Assessment')
const Progress = require('./models/Progress')
const BattleSession = require('./models/BattleSession')

const emails = [
  'techverse-e2e-1791188066872@example.test',
  'techverse-e2e-retest-1791188399198@example.test',
  'techverse-e2e-final-1791188570837@example.test',
]

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
  const users = await User.find({ email: { $in: emails } }, { _id: 1 }).lean()
  if (users.length !== emails.length) throw new Error(`Expected ${emails.length} disposable test users; found ${users.length}`)

  const userIds = users.map((user) => user._id)
  const assessments = await Assessment.deleteMany({ userId: { $in: userIds } })
  const progress = await Progress.deleteMany({ userId: { $in: userIds } })
  const battleSessions = await BattleSession.deleteMany({ userId: { $in: userIds } })
  const accounts = await User.deleteMany({ _id: { $in: userIds } })
  const remaining = await User.countDocuments({ email: { $in: emails } })
  if (remaining) throw new Error('Disposable E2E accounts remain after cleanup')

  console.log(JSON.stringify({
    usersRemoved: accounts.deletedCount,
    assessmentsRemoved: assessments.deletedCount,
    progressRemoved: progress.deletedCount,
    battleSessionsRemoved: battleSessions.deletedCount,
    remainingUsers: remaining,
  }))
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect()
  })
