const domainModules = {
  'Artificial Intelligence': [
    { id: 'ai-fundamentals', title: 'AI Fundamentals', level: 'Beginner', description: 'Meet the ideas behind intelligent systems.', xp: 100, difficulty: 'Easy' },
    { id: 'ai-python', title: 'Python for AI', level: 'Beginner', description: 'Prepare data and build small Python experiments.', xp: 120, difficulty: 'Easy' },
    { id: 'ai-machine-learning', title: 'Machine Learning Missions', level: 'Intermediate', description: 'Explore models, features, and evaluation.', xp: 180, difficulty: 'Medium' },
    { id: 'ai-neural-networks', title: 'Neural Network Citadel', level: 'Advanced', description: 'Trace how layered models learn representations.', xp: 260, difficulty: 'Hard' },
  ],
  'Web Development': [
    { id: 'web-fundamentals', title: 'HTML and CSS Foundations', level: 'Beginner', description: 'Shape accessible pages and style their structure.', xp: 100, difficulty: 'Easy' },
    { id: 'web-javascript', title: 'JavaScript Essentials', level: 'Beginner', description: 'Bring behavior and interaction to the web.', xp: 130, difficulty: 'Easy' },
    { id: 'web-react', title: 'React Interface Forge', level: 'Intermediate', description: 'Compose interactive interfaces from components.', xp: 190, difficulty: 'Medium' },
    { id: 'web-architecture', title: 'Web Architecture Mission', level: 'Advanced', description: 'Design resilient frontend and API boundaries.', xp: 280, difficulty: 'Hard' },
  ],
  'Cloud Computing': [
    { id: 'cloud-fundamentals', title: 'Cloud Fundamentals', level: 'Beginner', description: 'Understand regions, services, and shared responsibility.', xp: 100, difficulty: 'Easy' },
    { id: 'cloud-virtual-machines', title: 'Virtual Machines', level: 'Beginner', description: 'Explore compute instances and their lifecycle.', xp: 130, difficulty: 'Easy' },
    { id: 'cloud-networking', title: 'Cloud Networking', level: 'Intermediate', description: 'Connect subnets, routes, and secure services.', xp: 190, difficulty: 'Medium' },
    { id: 'cloud-containers', title: 'Containers and Deployment', level: 'Advanced', description: 'Plan container workloads and deployment strategy.', xp: 280, difficulty: 'Hard' },
  ],
  Cybersecurity: [
    { id: 'cyber-fundamentals', title: 'Security Fundamentals', level: 'Beginner', description: 'Learn core security goals and threat vocabulary.', xp: 100, difficulty: 'Easy' },
    { id: 'cyber-authentication', title: 'Authentication Defense', level: 'Beginner', description: 'Protect accounts with sound identity practices.', xp: 130, difficulty: 'Easy' },
    { id: 'cyber-web-security', title: 'Web Security Lab', level: 'Intermediate', description: 'Recognize common web risks and mitigations.', xp: 200, difficulty: 'Medium' },
    { id: 'cyber-threat-modeling', title: 'Threat Modeling', level: 'Advanced', description: 'Analyze attack surfaces and prioritize defenses.', xp: 290, difficulty: 'Hard' },
  ],
  'Data Science': [
    { id: 'data-fundamentals', title: 'Data Science Fundamentals', level: 'Beginner', description: 'Frame questions, observations, and datasets.', xp: 100, difficulty: 'Easy' },
    { id: 'data-analysis', title: 'Python Data Analysis', level: 'Beginner', description: 'Inspect and transform tabular data.', xp: 130, difficulty: 'Easy' },
    { id: 'data-visualization', title: 'Visualization Workshop', level: 'Intermediate', description: 'Choose visual encodings that reveal patterns.', xp: 190, difficulty: 'Medium' },
    { id: 'data-machine-learning', title: 'Applied Modeling Mission', level: 'Advanced', description: 'Build and evaluate a simple predictive workflow.', xp: 280, difficulty: 'Hard' },
  ],
}

const levelRank = { Beginner: 1, Intermediate: 2, Advanced: 3 }

function buildDomainPath(result, priorityIndex) {
  const modules = domainModules[result.domain]
  if (!modules) return null

  const assessmentRank = levelRank[result.level] || 1
  let previousAccessibleModule = null
  let currentModuleId = null
  const pathModules = modules.map((module) => {
    const moduleRank = levelRank[module.level]
    let status = 'locked'
    let lockedReason = ''

    if (moduleRank < assessmentRank) {
      status = 'available'
    } else if (moduleRank === assessmentRank && currentModuleId === null) {
      status = 'unlocked'
    } else if (moduleRank === assessmentRank && previousAccessibleModule) {
      lockedReason = `Complete ${previousAccessibleModule.title} to unlock this mission.`
    } else if (moduleRank > assessmentRank) {
      lockedReason = `Complete the ${result.domain} ${result.level.toLowerCase()} path to unlock ${module.level} missions.`
    } else {
      lockedReason = `Complete ${previousAccessibleModule?.title || 'the previous mission'} first.`
    }

    if (status === 'unlocked') currentModuleId = module.id
    if (status !== 'locked') previousAccessibleModule = module

    return {
      ...module,
      prerequisite: previousAccessibleModule?.id === module.id ? null : previousAccessibleModule?.id || null,
      status,
      unlocked: status !== 'locked',
      completed: status === 'available',
      lockedReason,
    }
  })

  const nextModule = pathModules.find((module) => module.status === 'unlocked') || pathModules.find((module) => module.status === 'available')
  return {
    domain: result.domain,
    score: result.score,
    total: result.total,
    percentage: result.percentage,
    level: result.level,
    priority: priorityIndex + 1,
    recommended: priorityIndex === 0,
    startHere: priorityIndex === 0,
    completedModules: pathModules.filter((module) => module.completed).map((module) => module.id),
    currentModuleId: nextModule?.id || null,
    progressPercentage: pathModules.length ? Math.round((pathModules.filter((module) => module.completed).length / pathModules.length) * 100) : 0,
    totalAvailableXp: pathModules.filter((module) => module.unlocked).reduce((sum, module) => sum + module.xp, 0),
    modules: pathModules,
  }
}

function buildLearningPath(assessment) {
  const recommendationOrder = new Map(assessment.recommendedDomains.map((domain, index) => [domain, index]))
  const paths = assessment.domainResults
    .map((result) => buildDomainPath(result, recommendationOrder.get(result.domain) ?? Number.MAX_SAFE_INTEGER))
    .filter(Boolean)
    .sort((left, right) => left.priority - right.priority)

  return {
    assessmentId: assessment._id,
    overallPercentage: assessment.overallPercentage,
    recommendedDomain: paths[0]?.domain || null,
    paths,
    generatedAt: new Date(),
  }
}

module.exports = { buildLearningPath }
