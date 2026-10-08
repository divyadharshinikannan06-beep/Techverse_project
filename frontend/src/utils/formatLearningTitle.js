const fantasyTerms = /\b(?:kingdom|realm|castle|citadel|fortress|quest|mission|tower|valley|mountain|observatory|nexus|forge|oracle|crystal)\b/gi

export default function formatLearningTitle(title) {
  if (typeof title !== 'string') return title
  const formatted = title.replace(fantasyTerms, '').replace(/\s{2,}/g, ' ').replace(/\s+([:.,])/g, '$1').trim()
  return formatted || title
}