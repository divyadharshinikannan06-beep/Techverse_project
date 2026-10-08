const assessmentQuestions = [
  {
    id: 'ai-1',
    domain: 'Artificial Intelligence',
    question: 'Which method helps a model learn from labeled examples?',
    options: ['Supervised learning', 'Disk formatting', 'Packet routing', 'Pixel compression'],
    correctIndex: 0,
  },
  {
    id: 'ai-2',
    domain: 'Artificial Intelligence',
    question: 'What is a feature in a machine learning dataset?',
    options: ['An input variable', 'A server password', 'A network cable', 'A deployment log'],
    correctIndex: 0,
  },
  {
    id: 'web-1',
    domain: 'Web Development',
    question: 'Which language gives structure to a web page?',
    options: ['HTML', 'SQL', 'Bash', 'Assembly'],
    correctIndex: 0,
  },
  {
    id: 'web-2',
    domain: 'Web Development',
    question: 'Which technology is primarily used to style web pages?',
    options: ['CSS', 'MongoDB', 'Docker', 'Git'],
    correctIndex: 0,
  },
  {
    id: 'cloud-1',
    domain: 'Cloud Computing',
    question: 'What does cloud elasticity allow a service to do?',
    options: ['Scale resources with demand', 'Encrypt every password automatically', 'Replace all databases', 'Remove the need for networks'],
    correctIndex: 0,
  },
  {
    id: 'cloud-2',
    domain: 'Cloud Computing',
    question: 'What is a container commonly used for?',
    options: ['Packaging an application and its dependencies', 'Drawing a circuit board', 'Editing a spreadsheet', 'Replacing source control'],
    correctIndex: 0,
  },
  {
    id: 'cyber-1',
    domain: 'Cybersecurity',
    question: 'Which practice adds a second verification step to sign-in?',
    options: ['Multi-factor authentication', 'Plaintext storage', 'Open ports', 'Shared credentials'],
    correctIndex: 0,
  },
  {
    id: 'cyber-2',
    domain: 'Cybersecurity',
    question: 'What does encryption protect?',
    options: ['Data confidentiality', 'Screen brightness', 'CPU temperature', 'File names only'],
    correctIndex: 0,
  },
  {
    id: 'data-1',
    domain: 'Data Science',
    question: 'What is a common purpose of data visualization?',
    options: ['Reveal patterns and trends', 'Compile a kernel', 'Route network traffic', 'Hash a password'],
    correctIndex: 0,
  },
  {
    id: 'data-2',
    domain: 'Data Science',
    question: 'Which statistic describes the middle value of ordered data?',
    options: ['Median', 'Port', 'Protocol', 'Gradient'],
    correctIndex: 0,
  },
]

const domainModules = {
  'Artificial Intelligence': ['Python for AI', 'Machine Learning Fundamentals', 'Neural Network Missions'],
  'Web Development': ['HTML and CSS Foundations', 'JavaScript Essentials', 'React Interface Forge'],
  'Cloud Computing': ['Cloud Fundamentals', 'Container Basics', 'Cloud Deployment Mission'],
  Cybersecurity: ['Security Fundamentals', 'Authentication Defense', 'Web Security Lab'],
  'Data Science': ['Python Data Analysis', 'Data Wrangling', 'Visualization Workshop'],
}

module.exports = { assessmentQuestions, domainModules }
