# 🔊 Real-Time Chat App with Face Match & Voice Input

This is a secure real-time chat app with:

✅ Sign-up/login with face match (AWS Rekognition)  
✅ Chat rooms with real-time messaging (Socket.IO)  
✅ Speech-to-text input (browser mic)  
✅ Next.js (App Router) + Tailwind + Prisma

---

## 🌐 Live Demo
➡️ https://your-vercel-app.vercel.app

---

## 🛠️ Tech Stack

- Next.js 14 (App Router)
- Prisma + PostgreSQL
- AWS Rekognition (Face auth)
- Socket.IO (WebSockets)
- Google Speech-to-Text (optional)
- Tailwind CSS

---

## 📦 Installation

```bash
git clone https://github.com/your-username/real-time-chat.git
cd real-time-chat
npm install
npx prisma migrate dev
npm run dev
