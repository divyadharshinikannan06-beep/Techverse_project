require('dotenv').config({ path: './backend/.env' })
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const path = require('node:path')
const mongoose = require('./backend/node_modules/mongoose')
const Progress = require('./backend/models/Progress')
const User = require('./backend/models/User')
const { recordQualifyingActivity, activityDate } = require('./backend/services/streakService')

const port = 51007
const baseUrl = `http://localhost:${port}`
const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
const accounts = [
  { name: 'Phase Eight Seeker', email: `phase8_${suffix}@test.com`, password: 'Techverse123', confirmPassword: 'Techverse123' },
  { name: 'Phase Eight Rival', email: `phase8_rival_${suffix}@test.com`, password: 'Techverse123', confirmPassword: 'Techverse123' },
]
const userIds = []

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function request(route, token, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  const response = await fetch(`${baseUrl}${route}`, { ...options, headers })
  const body = await response.json()
  return { response, body }
}

function dateOffset(days) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function main() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('Set MONGODB_URI and JWT_SECRET in backend/.env before running verification')
  const server = spawn(process.execPath, [path.join(__dirname, 'backend', 'server.js')], { cwd: __dirname, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  server.stdout.on('data', (chunk) => { output += chunk.toString() })
  server.stderr.on('data', (chunk) => { output += chunk.toString() })

  try {
    const deadline = Date.now() + 30000
    while (!(output.includes(`TechVerse API listening on http://localhost:${port}`) && output.includes('MongoDB connected successfully'))) {
      if (Date.now() > deadline || server.exitCode !== null) throw new Error(`Verification server did not become ready. ${output}`)
      await delay(250)
    }

    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 })
    for (const endpoint of ['/api/badges', '/api/leaderboard', '/api/streak']) {
      const unauthorized = await request(endpoint)
      assert.equal(unauthorized.response.status, 401, `${endpoint} must require authentication`)
    }

    const firstRegistration = await request('/api/auth/register', null, { method: 'POST', body: JSON.stringify(accounts[0]) })
    assert.equal(firstRegistration.response.status, 201)
    const firstToken = firstRegistration.body.token
    const firstUserId = firstRegistration.body.user.id
    userIds.push(firstUserId)
    const secondRegistration = await request('/api/auth/register', null, { method: 'POST', body: JSON.stringify(accounts[1]) })
    assert.equal(secondRegistration.response.status, 201)
    const secondToken = secondRegistration.body.token
    const secondUserId = secondRegistration.body.user.id
    userIds.push(secondUserId)

    const initialBadges = await request('/api/badges', firstToken)
    assert.equal(initialBadges.response.status, 200)
    assert.equal(initialBadges.body.badges.filter((badge) => badge.earned).length, 0)
    assert.equal(initialBadges.body.badges.length, 10)

    await Progress.create({ userId: firstUserId, totalXP: 100, completedModules: [{ moduleId: 'module-1', domain: 'Web Development', xpEarned: 100 }] })
    const firstBadgeResponse = await request('/api/badges', firstToken)
    assert.equal(firstBadgeResponse.body.badges.find((badge) => badge.id === 'first-steps').earned, true)
    const repeatedBadgeResponse = await request('/api/badges', firstToken)
    const firstBadgeRecords = await Progress.findOne({ userId: firstUserId }).lean()
    assert.equal(firstBadgeRecords.earnedBadges.filter((badge) => badge.badgeId === 'first-steps').length, 1)
    assert.equal(repeatedBadgeResponse.body.badges.find((badge) => badge.id === 'first-steps').earned, true)

    await Progress.updateOne(
      { userId: firstUserId },
      {
        $set: {
          totalXP: 1000,
          quizPassCount: 5,
          completedModules: Array.from({ length: 5 }, (_, index) => ({ moduleId: `module-${index + 1}`, domain: 'Web Development', xpEarned: 100 })),
          completedChallenges: [{ challengeId: 'challenge-1', moduleId: 'module-1', xpEarned: 100, language: 'javascript', testsPassed: 1, totalTests: 1 }],
          completedBattles: [{ battleId: 'battle-1', domain: 'Web Development', xpEarned: 100, correctAnswers: 5, totalQuestions: 5 }],
        },
      },
    )
    const milestoneBadges = await request('/api/badges', firstToken)
    const earnedIds = new Set(milestoneBadges.body.badges.filter((badge) => badge.earned).map((badge) => badge.id))
    for (const badgeId of ['first-steps', 'knowledge-seeker', 'quiz-master', 'code-explorer', 'arena-initiate', 'kingdom-builder', 'rising-star', 'tech-legend']) assert.equal(earnedIds.has(badgeId), true, `${badgeId} should be earned`)
    assert.equal(earnedIds.has('code-warrior'), false)
    assert.equal(earnedIds.has('arena-champion'), false)
    const clientClaim = await request('/api/badges', firstToken, { method: 'POST', body: JSON.stringify({ badgeId: 'arena-champion', earned: true }) })
    assert.equal(clientClaim.response.status, 404)
    const afterClientClaim = await request('/api/badges', firstToken)
    assert.equal(afterClientClaim.body.badges.find((badge) => badge.id === 'arena-champion').earned, false)

    await Progress.create({ userId: secondUserId, totalXP: 1500 })
    const leaderboard = await request('/api/leaderboard?limit=1', firstToken)
    assert.equal(leaderboard.response.status, 200)
    assert.equal(leaderboard.body.leaderboard.length, 1)
    assert.equal(leaderboard.body.leaderboard[0].xp, 1500)
    assert.equal(leaderboard.body.currentUser.xp, 1000)
    assert.ok(Number.isInteger(leaderboard.body.currentUser.rank))
    for (const entry of leaderboard.body.leaderboard) for (const forbidden of ['email', 'password', '_id', 'id']) assert.equal(Object.hasOwn(entry, forbidden), false)
    const allUsers = await User.find({}, { name: 1 }).lean()
    const allProgress = await Progress.find({}, { userId: 1, totalXP: 1 }).lean()
    const expectedRank = allUsers.map((user) => ({ id: String(user._id), name: user.name, xp: allProgress.find((record) => String(record.userId) === String(user._id))?.totalXP || 0 })).sort((left, right) => right.xp - left.xp || left.name.localeCompare(right.name)).findIndex((user) => user.id === firstUserId) + 1
    assert.equal(leaderboard.body.currentUser.rank, expectedRank)

    const firstActivity = await recordQualifyingActivity(secondUserId)
    assert.equal(firstActivity.currentStreak, 1)
    const sameDay = await recordQualifyingActivity(secondUserId)
    assert.equal(sameDay.currentStreak, 1)
    await Progress.updateOne({ userId: secondUserId }, { $set: { lastActivityDate: dateOffset(-1), currentStreak: 1 } })
    const consecutive = await recordQualifyingActivity(secondUserId)
    assert.equal(consecutive.currentStreak, 2)
    assert.equal(consecutive.longestStreak, 2)
    await Progress.updateOne({ userId: secondUserId }, { $set: { lastActivityDate: dateOffset(-3), currentStreak: 2 } })
    const missedDay = await recordQualifyingActivity(secondUserId)
    assert.equal(missedDay.currentStreak, 1)
    assert.equal(missedDay.longestStreak, 2)
    const streakApi = await request('/api/streak', secondToken)
    assert.equal(streakApi.body.streak.currentStreak, 1)
    assert.equal(streakApi.body.streak.longestStreak, 2)
    assert.equal(streakApi.body.streak.lastActivityDate, activityDate())

    const login = await request('/api/auth/login', null, { method: 'POST', body: JSON.stringify(accounts[0]) })
    assert.equal(login.response.status, 200)
    const persistedBadges = await request('/api/badges', login.body.token)
    assert.equal(persistedBadges.body.badges.find((badge) => badge.id === 'rising-star').earned, true)

    console.log('PASS: protected APIs, 10-badge catalog, badge idempotence, server-owned thresholds, client-claim rejection, persisted XP leaderboard/privacy/rank, streak same-day/consecutive/missed-day/longest rules, login persistence')
  } finally {
    try {
      if (mongoose.connection.readyState === 1 && userIds.length) await Promise.all([Progress.deleteMany({ userId: { $in: userIds } }), User.deleteMany({ _id: { $in: userIds } })])
    } finally {
      if (mongoose.connection.readyState === 1) await mongoose.disconnect()
      server.kill('SIGTERM')
      await delay(500)
      if (server.exitCode === null) server.kill('SIGKILL')
    }
  }
}

main().catch((error) => {
  console.error('FAIL:', error.message)
  process.exitCode = 1
})
