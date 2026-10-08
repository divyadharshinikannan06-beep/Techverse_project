const Progress = require('../models/Progress')
const { badges } = require('../data/badges')

function getCounts(progress) {
  const completedModules = progress?.completedModules?.length || 0
  const completedCoding = progress?.completedChallenges?.length || 0
  const completedBattles = progress?.completedBattles?.length || 0
  const passedQuizzes = progress?.quizPassCount || progress?.passedQuizzes?.length || 0
  const totalXP = progress?.totalXP || 0
  const milestoneCount = [completedModules > 0, completedCoding > 0, completedBattles > 0].filter(Boolean).length

  return { completedModules, completedCoding, completedBattles, passedQuizzes, totalXP, milestoneCount }
}

function getBadgeProgress(badge, counts) {
  const current = badge.requirementType === 'modules'
    ? counts.completedModules
    : badge.requirementType === 'quizzes'
      ? counts.passedQuizzes
      : badge.requirementType === 'coding'
        ? counts.completedCoding
        : badge.requirementType === 'battles'
          ? counts.completedBattles
          : badge.requirementType === 'xp'
            ? counts.totalXP
            : counts.milestoneCount

  return { current, target: badge.requirementValue, percentage: Math.min(100, Math.round((current / badge.requirementValue) * 100)) }
}

async function evaluateAndAwardBadges(userId) {
  const progress = await Progress.findOne({ userId }).lean()
  if (!progress) return { newlyAwarded: [], earnedBadges: [], counts: getCounts(null) }

  const counts = getCounts(progress)
  const existing = new Set((progress.earnedBadges || []).map((badge) => badge.badgeId))
  const newlyAwarded = []

  for (const badge of badges) {
    if (existing.has(badge.id)) continue
    const progressValue = getBadgeProgress(badge, counts).current
    if (progressValue < badge.requirementValue) continue

    const earnedAt = new Date()
    const updated = await Progress.findOneAndUpdate(
      { userId, 'earnedBadges.badgeId': { $ne: badge.id } },
      { $push: { earnedBadges: { badgeId: badge.id, earnedAt } } },
      { returnDocument: 'after' },
    )
    if (updated) {
      newlyAwarded.push({ id: badge.id, title: badge.title, description: badge.description, icon: badge.icon, category: badge.category, rarity: badge.rarity, earnedAt })
      existing.add(badge.id)
    }
  }

  const refreshed = await Progress.findOne({ userId }).lean()
  return { newlyAwarded, earnedBadges: refreshed?.earnedBadges || [], counts: getCounts(refreshed) }
}

async function getBadgeOverview(userId) {
  const evaluation = await evaluateAndAwardBadges(userId)
  const earnedById = new Map(evaluation.earnedBadges.map((badge) => [badge.badgeId, badge.earnedAt]))
  return {
    newlyAwarded: evaluation.newlyAwarded,
    badges: badges.map((badge) => ({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      earned: earnedById.has(badge.id),
      earnedAt: earnedById.get(badge.id) || null,
      progress: getBadgeProgress(badge, evaluation.counts),
    })),
  }
}

module.exports = { evaluateAndAwardBadges, getBadgeOverview, getCounts }
