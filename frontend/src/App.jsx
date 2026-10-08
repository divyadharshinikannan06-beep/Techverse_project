import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import PlacementTestPage from './pages/PlacementTestPage'
import DashboardPage from './pages/DashboardPage'
import ModuleLearningPage from './pages/ModuleLearningPage'
import CodingChallengesPage from './pages/CodingChallengesPage'
import CodingChallengePage from './pages/CodingChallengePage'
import BattleArenaPage from './pages/BattleArenaPage'
import BattlePage from './pages/BattlePage'
import WorldsPage from './pages/WorldsPage'
import ExplorePage from './pages/ExplorePage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import BadgesPage from './pages/BadgesPage'
import AdaptiveLearningPage from './pages/AdaptiveLearningPage'
import SettingsPage from './pages/SettingsPage'
import TechNewsPage from './pages/TechNewsPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function AssessmentGate({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user?.placementCompleted && !location.state?.assessmentComplete) {
    return <Navigate to="/placement" replace />
  }

  return children
}

function App() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()
  const authenticatedDestination = user?.placementCompleted
    ? location.state?.from || '/dashboard'
    : '/placement'

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          loading ? (
            <div className="page-loading">Loading TechVerse...</div>
          ) : isAuthenticated ? (
            <Navigate to={authenticatedDestination} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          loading ? (
            <div className="page-loading">Loading TechVerse...</div>
          ) : isAuthenticated ? (
            <Navigate to={authenticatedDestination} replace />
          ) : (
            <RegisterPage />
          )
        }
      />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/placement" element={<ProtectedRoute><PlacementTestPage /></ProtectedRoute>} />
      <Route path="/placement-test" element={<ProtectedRoute><PlacementTestPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><AssessmentGate><DashboardPage /></AssessmentGate></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><WorldsPage /></ProtectedRoute>} />
      <Route path="/learn/:moduleId" element={<ProtectedRoute><ModuleLearningPage /></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute><CodingChallengesPage /></ProtectedRoute>} />
      <Route path="/coding" element={<ProtectedRoute><CodingChallengesPage /></ProtectedRoute>} />
      <Route path="/coding/:challengeId" element={<ProtectedRoute><CodingChallengePage /></ProtectedRoute>} />
      <Route path="/battle-arena" element={<ProtectedRoute><BattleArenaPage /></ProtectedRoute>} />
      <Route path="/battle" element={<ProtectedRoute><BattleArenaPage /></ProtectedRoute>} />
      <Route path="/battle/:battleId" element={<ProtectedRoute><BattlePage /></ProtectedRoute>} />
      <Route path="/worlds" element={<ProtectedRoute><WorldsPage /></ProtectedRoute>} />
      <Route path="/tech-news" element={<ProtectedRoute><TechNewsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/adaptive" element={<ProtectedRoute><AdaptiveLearningPage /></ProtectedRoute>} />
      <Route path="/ai-lab" element={<ProtectedRoute><AdaptiveLearningPage /></ProtectedRoute>} />
      <Route path="/ai" element={<Navigate to="/ai-lab" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
