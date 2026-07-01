# CookLog 👨‍🍳🔥 

A specialized, public notebook web application designed for developers to log their deep-dive problem-solving skills and share a verified portfolio with recruiters. 

CookLog acts as a "meta-portfolio"—the application itself proves full-stack engineering skills, while the content logged inside it proves your algorithmic and problem-solving depth.

## 🚀 Live Demo
**[https://cook-log-mmwd.vercel.app/]**

## ✨ Core Features
* **Public Recruiter Profile:** A highly optimized, read-only view of a developer's logged questions accessed via a unique dynamic route (`/user/:username`).
* **Private Developer Dashboard:** A secure, authenticated workspace with markdown-supported forms to log problem statements, titles, and comprehensive code solutions.
* **Category & Topic Filtering:** Group logged questions by textbooks, topics, or specific domains (e.g., Data Structures, Math, System Design).
* **Row-Level Security (RLS):** Strict database policies ensuring users can only edit and manage their own logged entries.

## 🛠️ Tech Stack
This project was built using a modern, decoupled Single Page Application (SPA) architecture:
* **Frontend:** React, TypeScript, Vite
* **Styling:** Tailwind CSS
* **Backend & Auth:** Supabase (Postgres Database + GoTrue Authentication)
* **Hosting/Deployment:** Vercel
* **Routing:** React Router (v6)

## 📁 Project Architecture
* `src/assets/` - Static images and icons
* `src/components/` - Reusable UI primitives (Buttons, Modals, Cards)
* `src/pages/` - Core view layouts (`Dashboard.tsx`, `PublicProfile.tsx`)
* `src/services/` - Storage drivers, Supabase client, and data orchestration
* `src/types/` - Global TypeScript interfaces ensuring strict type contracts

## 💻 Local Development Setup
To run this project locally, clone the repository and run the following commands:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase keys (see `.env.example`):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
```

### How to apply this:
1. Paste that text into your `README.md` file (don't forget to swap in your actual Vercel link at the top!).
2. Save the file.
3. Run your standard git commands to push it to your repo:
   * `git add README.md`
   * `git commit -m "docs: update README with project overview and tech stack"`
   * `git push`

Once that is done, your GitHub profile will look incredibly professional to anyone who visits it. Let me know when you've pushed this update, and we can switch gears to figure out that bug in the log!
