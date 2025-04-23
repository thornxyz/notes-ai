# 📝 Notes.ai

A modern, full-featured note-taking app built with [Next.js](https://nextjs.org), powered by [Supabase](https://supabase.com) for authentication and storage, and enhanced with [Gemini](https://google.com/genai) for AI-generated note summaries.

## 🌐 Live Demo

Check out the live version of the app here: [https://notes-ai-ochre.vercel.app/](https://notes-ai-ochre.vercel.app/)

---

## ✨ Features

- 🔐 **Authentication** with Supabase (Email & Google OAuth)
- 🗒️ **Create, Edit, Delete Notes** with a sleek and responsive UI
- 🧠 **AI-Powered Summarization** with Gemini to distill your thoughts
- ⚛️ **Optimized Data Fetching** with React Query for seamless and performant client-side state management
- 📦 **Auto Sync & Caching** – Notes and user data are cached and kept in sync using React Query
- 📷 **User Profile with Image Upload**
- 💡 **Dark Mode Toggle**
- ⚡ Built with **Next.js App Router**, **Tailwind CSS**, and **ShadCN UI**

---

## 🚀 Getting Started

To get the app running locally:

```bash
git clone https://github.com/your-username/notes-ai.git
cd notes-ai
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root of the project and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

> You can get Supabase credentials from your [Supabase project dashboard](https://app.supabase.com).

---

## 📁 Project Structure

```
├── app/                # App Router pages and layouts
├── components/         # UI components (Navbar, ThemeToggle, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Helpers and utility logic
├── types/              # TypeScript interfaces and types
├── utils/              # Supabase and Gemini clients
├── public/             # Static assets
```

---

## 🧠 How Summarization Works

Each note can be sent to the Gemini API using the "Summarize" button, which uses powerful AI to generate a short and meaningful summary of your content.

This allows you to quickly review and understand long-form notes with ease.

---

## 🛠 Built With

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Gemini](https://google.com/genai)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [ShadCN UI](https://ui.shadcn.dev)
- [TypeScript](https://www.typescriptlang.org)
