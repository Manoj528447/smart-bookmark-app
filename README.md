# 🚀 Smart Bookmark App

A production-ready full-stack bookmark manager built using Next.js (App Router) and Supabase.

---

## ✨ Features

- Google OAuth Authentication (No email/password)
- Row Level Security (RLS) for data privacy
- Real-time database updates (cross-tab sync)
- Add bookmarks (title + URL)
- Delete bookmarks
- Private bookmarks per user
- Deployed on Vercel

---

## 🛠 Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (Auth + PostgreSQL + Realtime)
- Tailwind CSS
- Vercel (Deployment)

---

## 🗄 Database Schema

Table: `bookmarks`

- `id` (uuid, primary key)
- `title` (text)
- `url` (text)
- `user_id` (uuid, references auth.users)

Each bookmark is linked to a specific authenticated user using `user_id`.

---

## 🔐 Row Level Security (RLS)

Row Level Security was enabled to ensure that users can only access their own bookmarks.

Policies created:

- SELECT → `auth.uid() = user_id`
- INSERT → `auth.uid() = user_id`
- DELETE → `auth.uid() = user_id`

This guarantees that:
- Users cannot see other users' bookmarks
- Users cannot modify other users' data

---

## ⚡ Real-Time Implementation

Supabase Realtime was implemented using a channel subscription listening to `postgres_changes` on the `bookmarks` table.

When an INSERT or DELETE event occurs:
- The `fetchBookmarks()` function is triggered
- The UI updates instantly
- Changes sync across multiple open tabs without page refresh

This ensures true cross-tab real-time synchronization.

---

## 🧠 Problems Faced & Solutions

### 1️⃣ Realtime delete not syncing across tabs

**Issue:**  
Deleting a bookmark in one tab did not update in another tab.

**Cause:**  
Realtime subscription filter was too restrictive.

**Solution:**  
Removed the filter from the channel subscription and handled filtering inside `fetchBookmarks()` using `user_id`.

---

### 2️⃣ RLS blocking queries

**Issue:**  
Bookmarks were not fetching due to permission errors.

**Cause:**  
RLS was enabled but policies were not configured.

**Solution:**  
Created SELECT, INSERT, and DELETE policies using:
`auth.uid() = user_id`

---

### 3️⃣ Git identity error during commit

**Issue:**  
Git commit failed with "Author identity unknown".

**Solution:**  
Configured Git using:
```
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

## 🌍 Live Demo

Live URL: https://smart-bookmark-app-rho-five.vercel.app 
GitHub Repo: https://github.com/Manoj528447/smart-bookmark-app

---

## ⏱ Time Taken

Approximately 14 hours to complete including:
- Supabase project setup
- RLS configuration and debugging
- Real-time implementation and cross-tab synchronization
- Git setup and repository management
- Deployment to Vercel

---

## 📌 Conclusion

This project demonstrates secure authentication, database-level access control using RLS, and real-time UI synchronization using Supabase Realtime with Next.js App Router.

