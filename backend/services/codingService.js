const { challenges } = require('../data/codingChallenges')

function maskNonCode(source, language) {
  let output = ''
  let state = 'code'
  let quote = ''
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const next = source[index + 1]

    if (state === 'line-comment') {
      if (character === '\n') {
        state = 'code'
        output += '\n'
      } else output += ' '
      continue
    }
    if (state === 'block-comment') {
      if (character === '*' && next === '/') {
        output += '  '
        index += 1
        state = 'code'
      } else output += character === '\n' ? '\n' : ' '
      continue
    }
    if (state === 'string') {
      if (character === '\\') {
        output += '  '
        index += 1
      } else if (character === quote) {
        output += ' '
        state = 'code'
      } else output += character === '\n' ? '\n' : ' '
      continue
    }

    if (language === 'python' && character === '#') {
      output += ' '
      state = 'line-comment'
    } else if (language === 'javascript' && character === '/' && next === '/') {
      output += '  '
      index += 1
      state = 'line-comment'
    } else if (language === 'javascript' && character === '/' && next === '*') {
      output += '  '
      index += 1
      state = 'block-comment'
    } else if (character === '"' || character === "'" || (language === 'javascript' && character === '`')) {
      quote = character
      state = 'string'
      output += ' '
    } else output += character
  }
  return output
}

function validateChallengeSource(challenge, language, source) {
  const cleanSource = maskNonCode(source, language)
  const rules = challenge.validation[language]
  const checks = [{ id: 'returns-result', passed: /\breturn\b/.test(cleanSource) }]

  for (const [index, pattern] of rules.required.entries()) {
    const passed = new RegExp(pattern, 'm').test(cleanSource)
    checks.push({ id: `required-${index + 1}`, passed })
  }
  if (rules.anyOf?.length) {
    const passed = rules.anyOf.some((alternativeGroup) => alternativeGroup.every((pattern) => new RegExp(pattern, 'm').test(cleanSource)))
    checks.push({ id: 'implementation-approach', passed })
  }

  return { checks, testsPassed: checks.filter((check) => check.passed).length, totalTests: checks.length }
}

function getChallenge(challengeId) {
  return challenges.find((challenge) => challenge.id === challengeId) || null
}

function getPublicChallenge(challenge, language) {
  return {
    id: challenge.id,
    moduleId: challenge.moduleId,
    domain: challenge.domain,
    title: challenge.title,
    difficulty: challenge.difficulty,
    xp: challenge.xp,
    order: challenge.order,
    description: challenge.description,
    inputDescription: challenge.inputDescription,
    outputDescription: challenge.outputDescription,
    constraints: challenge.constraints,
    examples: challenge.examples,
    publicTestCaseCount: challenge.examples.length,
    starterCode: challenge.starterCode,
    supportedLanguages: challenge.supportedLanguages,
    hints: challenge.hints,
    explanation: challenge.explanation,
    language: language || null,
  }
}

module.exports = { challenges, getChallenge, getPublicChallenge, validateChallengeSource }
