# TechVerse

TechVerse is an AI-powered, gamified engineering learning ecosystem. Phase 1 establishes the React/Vite frontend and Express backend foundation for the Kingdom of Crystals experience.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB Atlas credentials for later phases

## Setup

```powershell
npm install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
npm run dev
```

The frontend runs at http://localhost:5173 and proxies `/api` requests to the backend at http://localhost:5000.

To use the AI Lab, add your Gemini API key to `backend/.env` as `GEMINI_API_KEY`. The backend defaults to `gemini-3.8-flash`; set `GEMINI_MODEL` there only if you want a different supported model. Keep this key out of frontend environment variables.

Verify the connection directly at http://localhost:5000/api/health or from the frontend status indicator.

## Phase 1 architecture

- `frontend/`: React 19, Vite, Tailwind CSS, React Router, Framer Motion, and the planned experience dependencies.
- `backend/`: Express API with security middleware, CORS, JSON parsing, logging, and an initial health endpoint.
- Root `npm run dev`: starts both applications concurrently.
- MongoDB and JWT configuration is documented in `backend/.env.example`; database/auth routes are intentionally deferred to later phases.
