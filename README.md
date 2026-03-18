# Koyō — AI-Powered Job Board

Koyō is a full-stack job board that aggregates real job listings from multiple sources and uses AI to help you find the best matches for your resume.

🌐 **Live Demo:** [koyo-livid.vercel.app](https://koyo-livid.vercel.app)

---

## Features

- 🔍 **Real Job Listings** — Live jobs from Adzuna and JSearch APIs
- 🤖 **AI Job Summaries** — Every job description summarized into 3 bullet points
- 📄 **Resume Matching** — Upload your PDF resume and get a match score for every job
- 🎯 **Smart Filters** — Filter by role, location, salary, job type
- ⚡ **Smart Caching** — Jobs cached in Supabase to reduce API calls
- 📱 **Responsive Design** — Works on mobile and desktop

---

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Express.js
- Groq API (Llama 3) — AI summaries and resume matching
- Adzuna API — Job listings
- JSearch API (RapidAPI) — Job listings

### Database
- Supabase (PostgreSQL)

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → Supabase

---

## Architecture
```
User Browser (Next.js)
        ↓
Express Backend (Render)
        ↓
    ┌───┴───┐
Supabase  External APIs
(Cache)   (Adzuna, JSearch)
        ↓
    Groq AI
(Summaries + Matching)
```

---

## Running Locally

### Prerequisites
- Node.js v18+
- npm

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
PORT=5000
ADZUNA_APP_ID=your_key
ADZUNA_APP_KEY=your_key
JSEARCH_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
GROQ_API_KEY=your_key
```
```bash
npm run dev
```

### Frontend Setup
```bash
npm install
```

Create a `.env.local` file in the root folder:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Roadmap

- [ ] User authentication
- [ ] Save jobs feature
- [ ] Resume persistence
- [ ] Free tier limits + payments (Razorpay)
- [ ] Email job alerts
- [ ] Company pages

---

## Author

Built by Ansh — [@anshdev0](https://github.com/anshdev0)