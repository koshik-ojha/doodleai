# AI Chatbot Full Stack

## Stack
- Frontend: Next.js 14 (App Router)
- Backend: Node.js + Express
- Database: MongoDB Atlas / local MongoDB
- UI: Tailwind CSS
- AI Provider: OpenRouter (free model)

## Project Structure
- `frontend/` → Next.js app
- `backend/` → Express API

## Quick Start

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Required Env

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-chatbot
FRONTEND_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_api_key
JWT_SECRET=supersecretkey
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Features
- Register / Login
- Create new chat
- Save chat history
- Rename / Delete chat
- AI messaging
- Markdown support
- Clean Tailwind UI
