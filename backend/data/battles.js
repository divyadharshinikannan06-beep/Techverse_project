const domainQuestions = {
  'Artificial Intelligence': [
    ['A supervised model learns from which kind of examples?', ['Unlabeled network routes', 'Labeled examples', 'CSS declarations', 'Encrypted backups'], 1, 'Supervised learning uses examples paired with target labels.'],
    ['What is a model feature?', ['An input variable describing an example', 'A server restart', 'A database password', 'A route response code'], 0, 'Features provide input information to a model.'],
    ['Why keep validation data separate from training data?', ['To increase duplicate examples', 'To estimate generalization on unseen data', 'To hide the target', 'To reduce all model errors to zero'], 1, 'Held-out examples help estimate how a model may work on new data.'],
    ['What does overfitting describe?', ['A model generalizes perfectly', 'A model memorizes training patterns and performs poorly on new cases', 'A server has too much capacity', 'A dataset has no labels'], 1, 'Overfit models capture training-specific noise rather than general patterns.'],
    ['Why should model outputs be reviewed in a high-impact workflow?', ['Outputs are always correct', 'Predictions can be uncertain or biased', 'Review removes the need for data', 'Models cannot be evaluated'], 1, 'Human review helps handle uncertainty and consequential mistakes.'],
  ],
  'Web Development': [
    ['Which technology provides semantic structure to a web document?', ['CSS', 'HTML', 'SQL', 'TLS'], 1, 'HTML defines the structure and meaning of web content.'],
    ['What is CSS primarily responsible for?', ['Layout and presentation', 'Authentication', 'Database indexing', 'DNS resolution'], 0, 'CSS styles and lays out document content.'],
    ['Why use a semantic button for an action?', ['It provides built-in keyboard and accessibility behavior', 'It prevents all server errors', 'It replaces authentication', 'It stores application state'], 0, 'Native buttons support keyboard interaction and assistive technologies.'],
    ['What should a server do with client-provided input?', ['Trust it because the browser validated it', 'Validate it at the server boundary', 'Use it as a database query directly', 'Ignore authorization'], 1, 'Client checks can be bypassed; server-side validation remains necessary.'],
    ['What does an HTTP status in the 4xx range generally indicate?', ['A successful response', 'A client-side request problem', 'A server reboot', 'A style-sheet rule'], 1, '4xx responses indicate a request or authorization issue from the client side.'],
  ],
  'Cloud Computing': [
    ['What does cloud elasticity help a service do?', ['Scale resources with changing demand', 'Avoid monitoring', 'Remove networking', 'Make every workload public'], 0, 'Elasticity allows resource capacity to adjust with demand.'],
    ['What is a virtual machine image commonly used for?', ['A repeatable operating-system starting point', 'A firewall exception', 'A chart legend', 'A password reset'], 0, 'Images provide a consistent base for virtual machine instances.'],
    ['What does a subnet divide?', ['A virtual network address space', 'A source-code function', 'A quiz score', 'A browser session'], 0, 'Subnets split a virtual network into smaller address segments.'],
    ['Which rule best follows least privilege for a database?', ['Allow every source and port', 'Allow only required application traffic', 'Expose it publicly by default', 'Disable access logging'], 1, 'Allowing only required traffic limits unnecessary access.'],
    ['What does a readiness check indicate?', ['Whether an instance can safely receive traffic', 'Whether a user chose a password', 'Whether code has comments', 'Whether a database is encrypted at rest'], 0, 'Readiness checks prevent routing traffic to instances that are not ready.'],
  ],
  Cybersecurity: [
    ['Which security goal prevents unauthorized information disclosure?', ['Availability', 'Confidentiality', 'Compression', 'Portability'], 1, 'Confidentiality protects information from unauthorized access.'],
    ['What is a vulnerability?', ['A weakness that may be exploited', 'A verified successful login', 'A backup copy', 'A deployment region'], 0, 'A vulnerability is a weakness that a threat may exploit.'],
    ['What does authentication verify?', ['What an identity may do', 'Who is presenting credentials', 'Which CSS file is active', 'Where a packet is routed'], 1, 'Authentication verifies identity; authorization governs permissions.'],
    ['What does least privilege mean?', ['Give all users administrator access', 'Grant only permissions needed for a task', 'Disable account checks', 'Share credentials between roles'], 1, 'Least privilege limits access to what a task requires.'],
    ['Why use parameterized database queries?', ['To separate input values from query structure', 'To skip input validation', 'To expose internal errors', 'To remove all access controls'], 0, 'Parameterization helps prevent untrusted input from changing query structure.'],
  ],
  'Data Science': [
    ['What should guide the choice of a data summary?', ['The analytical question and distribution', 'The brightest chart color', 'The largest possible number', 'The file extension'], 0, 'Summaries should fit both the question and the shape of the data.'],
    ['What does a row commonly represent in a dataset table?', ['One observation or record', 'A model layer', 'A network route', 'A CSS selector'], 0, 'Rows usually represent observations, while columns describe variables.'],
    ['When is a median often useful?', ['For skewed data with extreme values', 'Only for labels', 'When no values exist', 'To replace every chart'], 0, 'The median is less affected by extreme values than the mean.'],
    ['Which chart is commonly used to show change over ordered time?', ['Line chart', 'Unlabeled icon grid', 'Firewall rule list', 'Password meter'], 0, 'Lines make ordered trends easier to inspect.'],
    ['Why inspect model errors by subgroup?', ['To reveal uneven failure patterns', 'To hide uncertainty', 'To guarantee causal inference', 'To remove the need for a baseline'], 0, 'Aggregate metrics can hide different error rates across groups.'],
  ],
}

const battleDefinitions = [
  ['ai-neural-guardian', 'Artificial Intelligence', 'Neural Guardian', 'A sentinel tests how you reason about models and their limits.', 'Neural Guardian', 'Crystal construct', 1],
  ['ai-model-forge', 'Artificial Intelligence', 'Model Forge', 'A forge spirit challenges your knowledge of training and validation.', 'Forge Warden', 'Logic elemental', 2],
  ['ai-data-oracle', 'Artificial Intelligence', 'Data Oracle', 'An oracle guards the boundary between useful signals and misleading data.', 'Data Oracle', 'Signal phantom', 3],
  ['web-frontend-sentinel', 'Web Development', 'Frontend Sentinel', 'A tower sentinel challenges your understanding of accessible interfaces.', 'Frontend Sentinel', 'Rune automaton', 1],
  ['web-api-beast', 'Web Development', 'API Beast', 'An API creature tests your knowledge of requests, validation, and responses.', 'API Beast', 'Protocol beast', 2],
  ['web-full-stack-guardian', 'Web Development', 'Full Stack Guardian', 'A guardian challenges how you connect browser and server responsibilities.', 'Full Stack Guardian', 'Circuit knight', 3],
  ['cloud-cloud-warden', 'Cloud Computing', 'Cloud Warden', 'A cloud sentinel tests your grasp of scalable infrastructure.', 'Cloud Warden', 'Nimbus guardian', 1],
  ['cloud-container-titan', 'Cloud Computing', 'Container Titan', 'A towering construct tests deployment and container safety concepts.', 'Container Titan', 'Iron colossus', 2],
  ['cloud-infrastructure-guardian', 'Cloud Computing', 'Infrastructure Guardian', 'An infrastructure keeper challenges your network and reliability knowledge.', 'Infrastructure Guardian', 'Storm sentinel', 3],
  ['cyber-firewall-beast', 'Cybersecurity', 'Firewall Beast', 'A gatekeeper tests defensive security principles and access control.', 'Firewall Beast', 'Shield creature', 1],
  ['cyber-cipher-guardian', 'Cybersecurity', 'Cipher Guardian', 'A cipher guardian challenges your knowledge of identity and confidentiality.', 'Cipher Guardian', 'Encrypted sentinel', 2],
  ['cyber-security-sentinel', 'Cybersecurity', 'Security Sentinel', 'A sentinel tests how you reason about safe web systems and threats.', 'Security Sentinel', 'Watchtower construct', 3],
  ['data-phantom', 'Data Science', 'Data Phantom', 'A phantom tests how you summarize and interpret observations.', 'Data Phantom', 'Pattern shade', 1],
  ['data-analytics-guardian', 'Data Science', 'Analytics Guardian', 'An analytics guardian challenges your chart and data-quality choices.', 'Analytics Guardian', 'Prism keeper', 2],
  ['data-prediction-titan', 'Data Science', 'Prediction Titan', 'A prediction titan tests model evaluation and error analysis.', 'Prediction Titan', 'Forecast colossus', 3],
]

const battles = battleDefinitions.map(([id, domain, title, description, enemyName, enemyType, order]) => ({
  id,
  domain,
  title,
  description,
  enemyName,
  enemyType,
  difficulty: order === 1 ? 'Beginner' : order === 2 ? 'Intermediate' : 'Advanced',
  questionCount: 5,
  xpReward: order === 1 ? 100 : order === 2 ? 125 : 150,
  order,
  questions: domainQuestions[domain].map(([question, options, correctAnswer, explanation], index) => ({
    questionId: `${id}-q${index + 1}`,
    question,
    options,
    correctAnswer,
    explanation,
  })),
}))

module.exports = { battles }
