const Progress = require('../models/Progress')

function activityDate(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function calendarDayDifference(previousDate, currentDate) {
  const previous = Date.parse(`${previousDate}T00:00:00.000Z`)
  const current = Date.parse(`${currentDate}T00:00:00.000Z`)
  return Math.round((current - previous) / 86400000)
}

async function recordQualifyingActivity(userId) {
  const today = activityDate()
  let progress = await Progress.findOne({ userId }).lean()
  if (!progress) {
    progress = await Progress.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, lastActivityDate: today, currentStreak: 1, longestStreak: 1, streakUpdatedAt: new Date(), activityDates: [today] } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    ).lean()
    return getStreakState(progress)
  }

  if (progress.lastActivityDate === today) return getStreakState(progress)

  const nextStreak = progress.lastActivityDate && calendarDayDifference(progress.lastActivityDate, today) === 1
    ? progress.currentStreak + 1
    : 1
  const nextLongest = Math.max(progress.longestStreak || 0, nextStreak)
  const dates = [...new Set([...(progress.activityDates || []), today])].sort().slice(-30)
  const updated = await Progress.findOneAndUpdate(
    { userId, lastActivityDate: progress.lastActivityDate },
    { $set: { currentStreak: nextStreak, longestStreak: nextLongest, lastActivityDate: today, streakUpdatedAt: new Date(), activityDates: dates } },
    { returnDocument: 'after', runValidators: true },
  )

  if (updated) return getStreakState(updated)
  return recordQualifyingActivity(userId)
}

function getStreakState(progress) {
  return {
    currentStreak: progress?.currentStreak || 0,
    longestStreak: progress?.longestStreak || 0,
    lastActivityDate: progress?.lastActivityDate || null,
    streakUpdatedAt: progress?.streakUpdatedAt || null,
    recentActiveDays: (progress?.activityDates || []).slice(-14),
  }
}

async function getStreak(userId) {
  const progress = await Progress.findOne({ userId }).lean()
  return getStreakState(progress)
}

module.exports = { activityDate, recordQualifyingActivity, getStreak, getStreakState }
