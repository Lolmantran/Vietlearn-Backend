# 🇻🇳 MandarinMind Backend

REST + WebSocket API for **MandarinMind** — an AI-powered Vietnamese language learning platform. Built with **NestJS 11**, **Prisma 6**, **PostgreSQL** (Supabase), and **OpenAI GPT-4o-mini**.

---

## ✨ Features

### 🔐 Authentication
- Email/password registration & login with **Argon2** password hashing
- **Google OAuth** login (ID token verification via `google-auth-library`)
- **JWT** access tokens (Bearer) used across all protected endpoints
- `PATCH /me` — update level, learning goals, daily study goal

### 📚 Vocabulary & Flashcards
- 90 seeded Vietnamese flashcards across 4 curated decks (Core, Travel, Food & Dining, Business)
- Each card includes: word, pronunciation, meaning, example sentence, `partOfSpeech` (noun/verb/adjective/etc.)
- **AI-generated custom decks** — paste any text and GPT-4o-mini extracts vocabulary with POS tagging
- Per-deck enrollment and spaced-repetition review queue
- `GET /vocab/progress` — mastery % per deck (threshold: 21-day SRS interval)

### 🧠 Spaced Repetition System (SRS)
- SM-2 algorithm: interval, ease factor, repetition count per card
- Review ratings: `again / hard / good / easy` adjust next review date
- Due-today queue via `GET /vocab/review-queue`

### 🤖 AI Tutor (WebSocket + REST)
- Real-time chat powered by **Socket.io** + GPT-4o-mini
- Persistent session history (oldest-first ordering)
- Tutor adapts to user's current level (A1–C2)
- REST fallback: `POST /tutor/session/:id/message`

### 📝 Quiz
- AI-generated daily quizzes (multiple choice, fill-in-the-blank, translation)
- Randomised per session to avoid repeated questions
- Score submission with XP reward

### ✍️ Sentence Practice
- `POST /sentences/check` — AI grades a user-written Vietnamese sentence
- `POST /sentences/pattern-drill` — generates drill exercises for a grammar pattern

### 🏆 XP & Gamification
- XP awarded for every activity (quiz, vocab review, sentence check, tutor message)
- Daily XP reset with streak tracking (`currentStreak`, `longestStreak`)
- Study time tracking: `minutesStudiedToday` resets at midnight UTC

### 📊 Stats & Progress
- `GET /stats/overview` — real-time daily minutes, 7-day weekly activity bar chart, quiz performance
- `GET /stats/by-topic` — accuracy breakdown per learning goal
- Weekly activity uses `minutesStudiedToday` for today's bar (authoritative source)

### 🎓 Onboarding
- Placement test submission sets skill level
- Goal selection (Travel, Business, Conversation, Exam, Culture, Heritage)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (TypeScript) |
| ORM | Prisma 6 |
| Database | PostgreSQL via Supabase |
| Auth | JWT + Argon2 + Google OAuth |
| AI | OpenAI GPT-4o-mini |
| Real-time | Socket.io (WebSockets) |
| Validation | class-validator + class-transformer |
| API Docs | Swagger (`/api/docs`) |
| CI | GitHub Actions |

---

## 🗃️ Database Schema (key models)

```
User            — accounts, XP, streak, study time, daily goal
UserStats       — aggregate totals (reviews, words learned)
Deck            — vocabulary collections (CORE / TRAVEL / BUSINESS / CUSTOM)
Flashcard       — word, pronunciation, meaning, partOfSpeech, exampleSentence
FlashcardReview — SRS state per user per card (interval, easeFactor, nextReviewAt)
QuizSession     — quiz attempts + answers
TutorSession    — AI chat sessions
TutorMessage    — individual messages (USER | ASSISTANT role)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (or a free [Supabase](https://supabase.com) project)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
# Optional: GOOGLE_CLIENT_ID for Google OAuth

# 3. Run database migrations
npx prisma migrate deploy

# 4. Generate Prisma client
npx prisma generate

# 5. Seed 90 Vietnamese flashcards
npx ts-node prisma/seed.ts

# 6. Start development server
npm run start:dev
```

API available at `http://localhost:3000/api`  
Swagger docs at `http://localhost:3000/api/docs`

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-...
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Email/password login |
| POST | `/api/auth/google` | — | Google ID token login |
| POST | `/api/auth/logout` | Bearer | Invalidate session |
| GET | `/api/me` | Bearer | Get current user |
| PATCH | `/api/me` | Bearer | Update level / goals / dailyGoal |

### Vocabulary
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/vocab/decks` | Bearer | List all decks |
| GET | `/api/vocab/progress` | Bearer | Mastery % per enrolled deck |
| POST | `/api/vocab/deck/:id/enroll` | Bearer | Enroll in a deck |
| GET | `/api/vocab/review-queue` | Bearer | Cards due for review today |
| POST | `/api/vocab/review` | Bearer | Submit SRS rating |
| POST | `/api/vocab/generate-custom-deck` | Bearer | AI-generate deck from text |

### Tutor (WebSocket)
```
ws://localhost:3000  event: user_message  → { sessionId, content }
                     event: ai_response   ← { content, sessionId }
```

### Stats
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/stats/overview` | Bearer | XP, streaks, weekly activity |
| GET | `/api/stats/by-topic` | Bearer | Per-goal accuracy |

---

## 🏗️ Project Structure

```
src/
├── auth/           # JWT, Google OAuth, register/login
├── vocab/          # Decks, flashcards, SRS review
├── quiz/           # AI quiz generation & submission
├── tutor/          # AI chat (WebSocket + REST)
├── sentences/      # AI sentence checking & drills
├── stats/          # Progress overview & analytics
├── onboarding/     # Placement test & goal setup
├── xp/             # XP + study time tracking
├── srs/            # SM-2 spaced repetition algorithm
├── ai/             # OpenAI service wrapper
├── prisma/         # Prisma service
├── common/         # Guards, decorators, interceptors
└── main.ts
prisma/
├── schema.prisma   # Database schema (7 migrations applied)
├── seed.ts         # 90 Vietnamese flashcards with partOfSpeech
└── migrations/
.github/
└── workflows/
    └── ci.yml      # Build + typecheck on every push
```

---

## 🧪 CI / CD

GitHub Actions runs on every push and PR:

```
✅ npm ci
✅ prisma generate
✅ tsc --noEmit  (zero TypeScript errors)
✅ nest build
⚠️  eslint (warnings only)
```

---

## 📝 License

MIT


- 🔐 JWT Authentication
- 📚 Vocabulary management with HSK levels
- 🧠 Spaced Repetition System (SRS)
- 📊 Progress tracking & gamification
- 🏆 Achievements & badges
- 🔥 Learning streaks (48-hour leniency)
- 🎴 Flashcard & quiz system
- 🔊 Audio support (TTS integration ready)
- 📦 Word packs & lessons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your PostgreSQL connection string

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run seed
```

### Running the App

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## 📋 Database Schema

The database includes the following main entities:

- **User** - User accounts and authentication
- **Vocabulary** - Chinese words with pinyin, meanings, HSK levels
- **Review** - SRS review history and scheduling
- **FailedWord** - Track incorrect answers
- **UserProgress** - XP, levels, streaks
- **Achievement** - Badges and milestones
- **WordPack** - Organized vocabulary collections
- **Lesson** - Structured learning units

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (DEV ONLY)
npx prisma migrate reset
```

## 🏗️ Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── vocabulary/     # Vocabulary CRUD
├── srs/            # Spaced repetition logic
├── progress/       # User progress & XP
├── achievements/   # Badges & achievements
├── quiz/           # Quiz generation
├── audio/          # TTS integration
├── prisma/         # Prisma service
└── main.ts         # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

