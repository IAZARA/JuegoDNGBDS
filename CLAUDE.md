# CLAUDE.md - CyberDetective Academy

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | API | application programming interface |
| & | and/with | | DB | database |
| > | greater than | | UI | user interface |

## Project Overview

**Type**: Educational gamified web application
**Purpose**: Interactive learning platform for digital forensics & criminal data analysis
**Domain**: Cybersecurity education & law enforcement training
**Stack**: React + Node.js + PostgreSQL + Socket.io
**Architecture**: Full-stack web app with real-time collaboration features

## Core Technologies

```yaml
Frontend:
  Framework: React 19.1.0 w/ Vite 7.0.4
  Router: React Router DOM 7.7.0
  HTTP: Axios 1.10.0
  Animations: Framer Motion 12.23.6
  Visualizations: D3.js 7.9.0
  Real-time: Socket.io-client 4.8.1
  Toast: React Hot Toast 2.5.2

Backend:
  Runtime: Node.js w/ Express 5.1.0
  Database: PostgreSQL w/ pg 8.16.3
  Auth: JWT 9.0.2 + bcrypt 6.0.0
  Real-time: Socket.io 4.8.1
  Security: Helmet 8.1.0 + CORS 2.8.5
  Logging: Morgan 1.10.1

Development:
  Linting: ESLint 9.30.1 w/ React plugins
  Dev Server: Nodemon 3.1.10
  Build: Vite build system
```

## Project Structure

```
cyberdetective-academy/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers (auth, exercises, teams, admin)
│   │   ├── models/         # Data models (User, Exercise, Team, etc.)
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & admin middleware
│   │   ├── db/            # Database config, migrations, seeds
│   │   └── index.js       # Server entry point
│   └── package.json       # Backend dependencies
├── frontend/               # React client application
│   ├── src/
│   │   ├── components/    # React components (auth, exercises, teams, admin)
│   │   ├── pages/         # Main page components
│   │   ├── contexts/      # React contexts (AuthContext)
│   │   ├── services/      # API service layers
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles/        # CSS stylesheets
│   ├── dist/             # Build output
│   └── package.json      # Frontend dependencies
├── docs/                 # Technical documentation
├── start.sh              # Development startup script
└── README.md             # Project documentation
```

## Development Commands

```yaml
Setup:
  # Full application setup
  chmod +x start.sh && ./start.sh

Backend:
  cd backend
  npm install              # Install dependencies
  npm run dev             # Development server (nodemon)
  npm start               # Production server
  node src/db/init-db.js  # Initialize database

Frontend:
  cd frontend
  npm install             # Install dependencies
  npm run dev            # Development server (port 5173)
  npm run build          # Production build
  npm run preview        # Preview build
  npm run lint           # Run ESLint

Database:
  # PostgreSQL setup (from start.sh)
  createuser cyberdetective
  createdb cyberdetective_db
  # Schema: src/db/schema.sql
  # Seeds: src/db/seed.sql
```

## Key Features & Architecture

```yaml
Core Systems:
  - User authentication & JWT-based sessions
  - Gamified learning with 15+ interactive exercises
  - 4-tier difficulty system (Detective Junior → Jefe de Inteligencia)
  - Real-time team collaboration w/ Socket.io
  - Points-based ranking & leaderboard system
  - Admin panel for exercise & user management

Exercise Categories:
  - Data cleaning & anomaly detection
  - Cryptocurrency tracing & blockchain analysis
  - Digital identity verification
  - Network analysis & criminal connections
  - Deepfake detection & AI-generated content
  - Malware analysis & cybersecurity
```

## Database Schema

```yaml
Core Tables:
  users: User accounts, points, levels
  exercises: Exercise definitions w/ JSON problem/solution data
  exercise_attempts: User progress & results
  teams: Team information & stats
  team_members: Team membership & roles
  team_invitations: Team invitation system
  team_exercise_attempts: Collaborative exercise sessions
  leaderboard: Global & team rankings
  badges: Achievement system (future)

Key Features:
  - PostgreSQL w/ JSON columns for flexible exercise data
  - Team collaboration system w/ invitation workflow
  - Comprehensive audit trail for attempts & contributions
  - Automatic ranking updates via triggers
```

## Development Patterns

```yaml
Frontend:
  - Functional components w/ hooks
  - Context API for global state (AuthContext)
  - Service layer pattern for API calls
  - Protected routes w/ authentication
  - Responsive design w/ mobile-first approach

Backend:
  - RESTful API design
  - Modular controller/route/model structure
  - JWT middleware for protected endpoints
  - PostgreSQL w/ parameterized queries
  - Real-time WebSocket integration

Security:
  - Password hashing w/ bcrypt
  - JWT token-based authentication
  - CORS configuration
  - Helmet security headers
  - Admin-only routes w/ role verification
```

## Configuration

```yaml
Environment Variables:
  Backend (.env):
    NODE_ENV=development
    PORT=3001
    DATABASE_URL=postgresql://cyberdetective:cyberdetective123@localhost:5432/cyberdetective_db
    JWT_SECRET=your_jwt_secret_here
    JWT_EXPIRE=7d
    CLIENT_URL=http://localhost:5173

  Frontend (.env):
    VITE_API_URL=http://localhost:3001/api

Ports:
  Frontend: 5173 (Vite dev server)
  Backend: 3001 (Express server)
  Database: 5432 (PostgreSQL)
```

## Testing Strategy

```yaml
E2E Testing:
  Tool: Playwright MCP
  Application URL: http://localhost:5173/
  Test Login:
    Email: ivan.agustin.95@gmail.com
    Password: Vortex733-
  
  Test Coverage:
    - Authentication flow & user registration
    - Exercise completion & validation
    - Team creation & collaboration features
    - Admin panel functionality
    - Real-time chat & voting systems
    - Leaderboard & ranking updates
    - Mobile responsiveness

Future Testing Needs:
  - Unit tests for models & controllers
  - Integration tests for API endpoints
  - Socket.io testing for real-time features
  - Database migration testing

Frameworks to Add:
  - Jest for unit/integration testing
  - Supertest for API testing
```

## Key Business Logic

```yaml
Gamification:
  - 4 difficulty levels w/ increasing point values (10→20→30→40 pts)
  - 15 exercises covering forensics & cybersecurity topics
  - Real-time leaderboard & ranking system
  - Team collaboration w/ shared exercises

Exercise System:
  - JSON-based problem/solution storage
  - Flexible validation system
  - Hint system w/ point penalties
  - Time tracking & performance metrics

Team Features:
  - 4-5 member teams w/ leader hierarchy
  - Invitation-based membership
  - Collaborative exercise solving
  - Real-time chat & voting systems
```

## Admin System

```yaml
Features:
  - Separate admin authentication
  - Exercise management (CRUD operations)
  - User management & statistics
  - System monitoring & analytics
  - Presenter guide for educational use

Access:
  - Admin-only routes protected by middleware
  - Role-based permissions
  - Audit logging for admin actions
```

## Performance Considerations

```yaml
Optimizations:
  - Database indexing on frequently queried columns
  - Connection pooling for PostgreSQL
  - Static file serving through Vite
  - Efficient WebSocket room management
  - JSON data compression for exercises

Monitoring Needs:
  - Real-time user activity tracking
  - Database query performance
  - WebSocket connection health
  - Memory usage for large datasets
```

## Deployment Notes

```yaml
Production Setup:
  - PostgreSQL server configuration
  - Environment-specific JWT secrets
  - CORS configuration for production domains
  - WebSocket server configuration
  - Static file serving optimization

Scaling Considerations:
  - Database connection pooling
  - Redis for session management (future)
  - CDN for static assets
  - Load balancing for WebSocket connections
```

## Common Issues & Solutions

```yaml
Database:
  Issue: Connection errors
  Solution: Check PostgreSQL service & credentials in .env

  Issue: Migration failures
  Solution: Run init-db.js, check schema.sql syntax

Frontend:
  Issue: API connection failures
  Solution: Verify VITE_API_URL matches backend port

  Issue: Socket.io connection issues
  Solution: Check CORS configuration & port accessibility

Development:
  Issue: Port conflicts
  Solution: Update vite.config.js or backend PORT env var

Exercise Rendering:
  Issue: Exercise data not displaying (only question/context visible)
  Root Cause: Type mismatch between DB exercise type & renderProblemData() cases
  Location: frontend/src/components/exercises/ExercisePlayer.jsx
  
  Diagnosis:
    1. Check exercise type in database
    2. Verify matching case exists in renderProblemData() switch
    3. Ensure specific data rendering code is in correct case
    
  Common Fix Pattern:
    - Move data rendering code to correct exercise type case
    - Add missing cases for new exercise types
    - Verify data.companies, data.communication_network, etc. render properly
    
  Known Affected Exercises: 46, 53, 55
  Reference: docs/exercise-rendering-bug-fix.md for detailed examples
```

## Next Development Priorities

```yaml
High Priority:
  - Complete exercise validation system
  - Implement remaining 15 exercises
  - Add comprehensive error handling
  - Set up proper testing framework

Medium Priority:
  - Real-time notifications system
  - Advanced analytics dashboard
  - Mobile app optimization
  - Performance monitoring

Future Features:
  - AI-powered exercise generation
  - Integration w/ external forensics tools
  - Multi-language support
  - Advanced team tournament system
```

---
*CyberDetective Academy - Educational platform for digital forensics training*
*Stack: React + Node.js + PostgreSQL + Socket.io | Gamified learning system*