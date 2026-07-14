# Turners Cars - Tina Insurance Chatbot

A full-stack web app for Turners Cars featuring **Tina**, an AI-powered insurance assistant. Tina has a natural conversation with the customer about their vehicle, recommends an insurance policy (Mechanical Breakdown, Comprehensive, or Third Party), gives a ballpark price estimate, and can email a summary of the recommendation to the customer.

## Features

- Conversational AI chat assistant (Google Gemini) that asks about the customer's vehicle and needs, one question at a time
- Automatic policy recommendation with business rules applied (e.g. MBI isn't offered to trucks/racing cars, Comprehensive only for vehicles under 10 years old)
- Indicative price estimate (NZD/month) included with every recommendation, clearly labeled as non-binding
- Email the recommendation summary to the customer via Gmail
- Backend health check with graceful offline fallback in the UI
- "Start over" control to reset the conversation
- Fully dockerized for local development

## Tech Stack

- **Frontend:** React 19 + Vite, plain CSS
- **Backend:** Node.js + Express
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Email:** Nodemailer via Gmail

## Project Structure

```
mission-4/
├── backend/
│   ├── controllers/chatController.js   # Chat, health, and email-send logic
│   ├── routes/chatRoutes.js
│   ├── server.js                       # Express entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/                 # Tina chat widget UI
│   │   └── hooks/useTinaChat.js        # Chat state + API calls
│   ├── App.jsx
│   └── Dockerfile
├── docker-compose.yml
└── .env                                # Not committed - see setup below
```

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` in the project root and fill in:

```
GEMINI_API_KEY=your-gemini-api-key
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-gmail-app-password
VITE_API_URL=http://localhost:5000
```

- Get a Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey).
- `EMAIL_PASS` must be a Gmail **App Password** (Google Account → Security → 2-Step Verification → App Passwords), not your regular login password.

### 2. Run locally (without Docker)

```
cd backend
npm install
node server.js
```

```
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

### 3. Run with Docker

```
docker compose up --build
```

This builds and runs both services together, using the same root `.env` file for configuration.

## Notes

- `node_modules` and `.env` files are intentionally excluded from git — run `npm install` after cloning.
- The AI model automatically retries and falls back to a secondary Gemini model if the primary one is temporarily overloaded.
