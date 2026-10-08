require('dotenv').config({ path: './backend/.env' })
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const path = require('node:path')
const mongoose = require('./backend/node_modules/mongoose')
const Assessment = require('./backend/models/Assessment')
const BattleSession = require('./backend/models/BattleSession')
const Progress = require('./backend/models/Progress')
const User = require('./backend/models/User')
const { assessmentQuestions } = require('./backend/config/assessmentQuestions')
const { battles } = require('./backend/data/battles')

const port = 51006
const baseUrl = `http://localhost:${port}`
const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
const accounts = [
  { name: 'Phase Seven Challenger', email: `phase7_${suffix}@test.com`, password: 'Techverse123', confirmPassword: 'Techverse123' },
  { name: 'Phase Seven Visitor', email: `phase7_visitor_${suffix}@test.com`, password: 'Techverse123', confirmPassword: 'Techverse123' },
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

async function main() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('Set MONGODB_URI and JWT_SECRET in backend/.env before running verification')

  const server = spawn(process.execPath, [path.join(__dirname, 'backend', 'server.js')], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
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
    const unauthenticated = await request('/api/battle')
    assert.equal(unauthenticated.response.status, 401, 'Battle routes must require authentication')

    const firstRegistration = await request('/api/auth/register', null, { method: 'POST', body: JSON.stringify(accounts[0]) })
    assert.equal(firstRegistration.response.status, 201, firstRegistration.body.message)
    const firstToken = firstRegistration.body.token
    const firstUserId = firstRegistration.body.user.id
    userIds.push(firstUserId)

    const secondRegistration = await request('/api/auth/register', null, { method: 'POST', body: JSON.stringify(accounts[1]) })
    assert.equal(secondRegistration.response.status, 201, secondRegistration.body.message)
    const secondToken = secondRegistration.body.token
    userIds.push(secondRegistration.body.user.id)

    const assessment = await request('/api/assessment/submit', firstToken, {
      method: 'POST',
      body: JSON.stringify({ answers: assessmentQuestions.map((question) => ({ questionId: question.id, selectedIndex: question.correctIndex })) }),
    })
    assert.equal(assessment.response.status, 201, assessment.body.message)

    const progressResponse = await request('/api/progress/me', firstToken)
    assert.equal(progressResponse.response.status, 200)
    const pathState = progressResponse.body.progress.learningPath.paths[0]
    const gateModule = pathState.modules.find((module) => !module.assessmentCredit)
    assert.ok(gateModule, 'Assessment must expose a first non-credited module gate')

    const lockedList = await request('/api/battle', firstToken)
    assert.equal(lockedList.response.status, 200)
    const firstBattle = lockedList.body.battles.find((battle) => battle.domain === pathState.domain && battle.order === 1)
    const secondBattle = lockedList.body.battles.find((battle) => battle.domain === pathState.domain && battle.order === 2)
    assert.equal(firstBattle.status, 'locked', 'Assessment credit alone must not unlock battles')
    const lockedAttempt = await request('/api/battle/start', firstToken, { method: 'POST', body: JSON.stringify({ battleId: firstBattle.id }) })
    assert.equal(lockedAttempt.response.status, 423)

    await Progress.findOneAndUpdate(
      { userId: firstUserId },
      { $setOnInsert: { userId: firstUserId, totalXP: 0 }, $push: { completedModules: { moduleId: gateModule.id, domain: pathState.domain, completedAt: new Date(), xpEarned: gateModule.xp } } },
      { upsert: true, setDefaultsOnInsert: true },
    )

    const unlockedList = await request('/api/battle', firstToken)
    const unlockedFirst = unlockedList.body.battles.find((battle) => battle.id === firstBattle.id)
    const stillLockedSecond = unlockedList.body.battles.find((battle) => battle.id === secondBattle.id)
    assert.equal(unlockedFirst.status, 'unlocked')
    assert.equal(stillLockedSecond.status, 'locked', 'Later battles must remain sequentially locked')
    const unavailableBattle = await request(`/api/battle/${secondBattle.id}`, firstToken)
    assert.equal(unavailableBattle.response.status, 423)

    const start = await request('/api/battle/start', firstToken, { method: 'POST', body: JSON.stringify({ battleId: firstBattle.id }) })
    assert.equal(start.response.status, 201)
    const sessionId = start.body.sessionId
    assert.ok(!('correctAnswer' in start.body.question) && !('explanation' in start.body.question), 'Public questions must not disclose answers')
    const foreignAnswer = await request('/api/battle/answer', secondToken, { method: 'POST', body: JSON.stringify({ sessionId, questionId: start.body.question.questionId, answer: 1 }) })
    assert.equal(foreignAnswer.response.status, 404, 'Sessions must be scoped to their owner')
    const earlyFinish = await request('/api/battle/finish', firstToken, { method: 'POST', body: JSON.stringify({ sessionId }) })
    assert.equal(earlyFinish.response.status, 409, 'Clients must not claim XP before the server marks a terminal result')

    const battleDefinition = battles.find((battle) => battle.id === firstBattle.id)
    let wrongQuestion = start.body.question
    const wrongAnswerIndex = (battleDefinition.questions[0].correctAnswer + 1) % 4
    const wrong = await request('/api/battle/answer', firstToken, { method: 'POST', body: JSON.stringify({ sessionId, questionId: wrongQuestion.questionId, answer: wrongAnswerIndex }) })
    assert.equal(wrong.response.status, 200)
    assert.equal(wrong.body.correct, false)
    assert.equal(wrong.body.playerHp, 80)
    assert.equal(wrong.body.enemyHp, 100)
    const duplicateAnswer = await request('/api/battle/answer', firstToken, { method: 'POST', body: JSON.stringify({ sessionId, questionId: wrongQuestion.questionId, answer: wrongAnswerIndex }) })
    assert.equal(duplicateAnswer.response.status, 409)

    const winStart = await request('/api/battle/start', firstToken, { method: 'POST', body: JSON.stringify({ battleId: firstBattle.id }) })
    assert.equal(winStart.response.status, 201)
    let currentQuestion = winStart.body.question
    let finalAnswer
    for (const question of battleDefinition.questions) {
      assert.equal(currentQuestion.questionId, question.questionId)
      finalAnswer = await request('/api/battle/answer', firstToken, { method: 'POST', body: JSON.stringify({ sessionId: winStart.body.sessionId, questionId: currentQuestion.questionId, answer: question.correctAnswer }) })
      assert.equal(finalAnswer.response.status, 200)
      currentQuestion = finalAnswer.body.nextQuestion
    }
    assert.equal(finalAnswer.body.result, 'victory')

    const finish = await request('/api/battle/finish', firstToken, { method: 'POST', body: JSON.stringify({ sessionId: winStart.body.sessionId }) })
    assert.equal(finish.response.status, 200)
    assert.equal(finish.body.xpAwarded, firstBattle.xpReward)
    assert.equal(finish.body.correctAnswers, battleDefinition.questionCount)
    const duplicateFinish = await request('/api/battle/finish', firstToken, { method: 'POST', body: JSON.stringify({ sessionId: winStart.body.sessionId }) })
    assert.equal(duplicateFinish.response.status, 409)

    const afterVictory = await request('/api/battle', firstToken)
    assert.equal(afterVictory.body.totalXP, firstBattle.xpReward)
    assert.equal(afterVictory.body.battles.find((battle) => battle.id === firstBattle.id).status, 'completed')
    assert.equal(afterVictory.body.battles.find((battle) => battle.id === secondBattle.id).status, 'unlocked')

    console.log('PASS: auth, assessment gate, user-owned sessions, hidden answers, HP, duplicate-answer protection, victory XP, duplicate-finish protection, sequential unlock')
  } finally {
    try {
      if (mongoose.connection.readyState === 1 && userIds.length) {
        await Promise.all([
          BattleSession.deleteMany({ userId: { $in: userIds } }),
          Assessment.deleteMany({ userId: { $in: userIds } }),
          Progress.deleteMany({ userId: { $in: userIds } }),
          User.deleteMany({ _id: { $in: userIds } }),
        ])
      }
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
