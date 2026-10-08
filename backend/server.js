const path = require('path')
const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const connectDB = require('./config/db')
const healthRoutes = require('./routes/healthRoutes')
const authRoutes = require('./routes/authRoutes')
const assessmentRoutes = require('./routes/assessmentRoutes')
const learningRoutes = require('./routes/learningRoutes')
const progressRoutes = require('./routes/progressRoutes')
const quizRoutes = require('./routes/quizRoutes')
const codingRoutes = require('./routes/codingRoutes')
const battleRoutes = require('./routes/battleRoutes')
const badgeRoutes = require('./routes/badgeRoutes')
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const streakRoutes = require('./routes/streakRoutes')
const adaptiveRoutes = require('./routes/adaptiveRoutes')
const aiRoutes = require('./routes/aiRoutes')
const newsRoutes = require('./routes/newsRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 5000

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/', (_request, response) => {
  response.json({
    app: 'TechVerse',
    status: 'online',
    message: 'TechVerse backend is ready',
  })
})

app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/assessment', assessmentRoutes)
app.use('/api/learning', learningRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/coding', codingRoutes)
app.use('/api/battle', battleRoutes)
app.use('/api/badges', badgeRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/streak', streakRoutes)
app.use('/api/adaptive', adaptiveRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/news', newsRoutes)

app.use(notFound)
app.use(errorHandler)

const startServer = async () => {
  await connectDB()
  app.listen(port, () => {
    console.log(`TechVerse API listening on http://localhost:${port}`)
  })
}

startServer()
