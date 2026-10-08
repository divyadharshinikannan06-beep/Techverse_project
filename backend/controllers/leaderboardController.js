const mongoose = require('mongoose')
const Progress = require('../models/Progress')
const User = require('../models/User')

function parseLimit(value) {
  if (value === undefined) return 20
  if (!/^\d+$/.test(String(value))) return null
  const limit = Number(value)
  return limit >= 1 && limit <= 100 ? limit : null
}

async function getLeaderboard(request, response) {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({ status: 'error', message: 'Leaderboard records are temporarily unavailable' })
    return
  }
  const limit = parseLimit(request.query.limit)
  if (!limit) {
    response.status(400).json({ status: 'error', message: 'limit must be a whole number between 1 and 100' })
    return
  }

  try {
    const [users, progressRecords] = await Promise.all([
      User.find({}, { name: 1, level: 1 }).lean(),
      Progress.find({}, { userId: 1, totalXP: 1, earnedBadges: 1 }).lean(),
    ])
    const progressByUser = new Map(progressRecords.map((progress) => [String(progress.userId), progress]))
    const ranked = users
      .map((user) => {
        const progress = progressByUser.get(String(user._id))
        return {
          id: String(user._id),
          name: typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'Tech Explorer',
          xp: progress?.totalXP || 0,
          badgeCount: progress?.earnedBadges?.length || 0,
          level: user.level || 1,
        }
      })
      .sort((left, right) => right.xp - left.xp || left.name.localeCompare(right.name))
      .map((user, index) => ({ ...user, rank: index + 1 }))

    const publicEntry = (user) => ({ rank: user.rank, name: user.name, xp: user.xp, badgeCount: user.badgeCount, level: user.level })
    const currentUser = ranked.find((user) => user.id === String(request.user._id))
    response.status(200).json({
      status: 'success',
      leaderboard: ranked.slice(0, limit).map(publicEntry),
      currentUser: currentUser ? { rank: currentUser.rank, xp: currentUser.xp, badgeCount: currentUser.badgeCount, level: currentUser.level } : { rank: null, xp: 0, badgeCount: 0, level: 1 },
    })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load the leaderboard right now' })
  }
}

module.exports = { getLeaderboard }
