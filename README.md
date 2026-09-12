# UniMate — Your University. Your Community.

> **Connect. Learn. Share. Help.**
> A production-ready full-stack university student community and academic resource platform for **KFUEIT** built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAhmedkhn143%2FUni-Mate)

---

## 1. Product Overview

UniMate unifies fragmented student life into a single modern, secure, and university-verified hub:
* **Academic Q&A Hub**: Coursework questions, tags, voting, accepted answers, and nested comments.
* **Campus Lost & Found**: Report lost belongings or discovered items, filter by location and category, in-app student chat, and resolution tracking.
* **Structured Past Exam Papers**: Hierarchical archive (Department → Program → Semester → Subject → Year → Exam Type) with PDF uploads, in-browser previews, and verified downloads.
* **Scholarships & Opportunities**: Curated grants, engineering internships, fellowships, and startup competitions with deadlines and eligibility criteria.
* **Community Discussions**: Announcements, study groups, like reactions, and peer discussions.
* **Student-to-Student Messaging**: Real-time peer communication with conversation threads and safety checks.
* **Admin Suite & Moderation**: University domain configuration, reports moderation queue, student directory, past paper approval workflow, and academic registry management.

---

## 2. Tech Stack

* **Frontend Framework**: Next.js 15 (App Router, Server & Client Components)
* **Language**: TypeScript 5 (Strict type checking)
* **Styling**: Tailwind CSS v4 (Custom color tokens, glassmorphism, responsive mobile layout)
* **Icons**: Lucide React
* **Database & Auth**: PostgreSQL on Supabase with Row Level Security (RLS)
* **State & Persistence**: Dual-mode data layer (Live Supabase integration with seamless local reactive fallback for zero-friction local development)

---

## 3. Quick Start & Local Development

### Prerequisites
* Node.js v18+ (tested on v24.16.0)
* npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Generate Sample PDF Past Papers (if needed)
```bash
node scripts/create-sample-pdfs.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Demo Accounts & Quick Switch

UniMate includes one-click role switching in the navbar and login page:

| Role | Name | Email | Details |
| :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `alex.rivera@student.edu` | BS Computer Science, Semester 4 |
| **Student** | Maya Patel | `maya.patel@student.edu` | BS Electrical Engineering, Semester 3 (Lab TA) |
| **Admin** | Dr. Sarah Hayes | `admin@student.edu` | Campus Moderator & Academic Coordinator |

---

## 5. Supabase Production Setup

### Database Schema Execution
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Go to the **SQL Editor** tab.
3. Paste and run the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Run [`supabase/seed.sql`](./supabase/seed.sql) to populate initial departments, courses, questions, past papers, and scholarships.

### Storage Buckets Setup
Create the following buckets in the **Storage** section of your Supabase dashboard:
* `past-papers` (Public: false, Max size: 25MB, Allowed MIME types: `application/pdf`)
* `lost-found` (Public: true, Max size: 10MB, Allowed MIME types: `image/*`)
* `avatars` (Public: true, Max size: 5MB, Allowed MIME types: `image/*`)

### Row Level Security (RLS)
All 18 tables have RLS enabled with granular policies:
* **Students**: Can create and edit only their own questions, answers, posts, and lost & found reports.
* **Admins**: Have full moderation privileges, user suspension powers, and paper approval rights via the `is_admin()` database function.
* **Messages**: Only conversation participants can select and insert messages.

---

## 6. University Email Domain Enforcement

Configure institutional domains in `.env.local` or directly through the Admin settings UI:
```env
NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN=student.edu,university.edu,metrostate.edu
```
Students attempting registration with non-institutional email addresses (e.g. `@gmail.com`) are prevented from creating accounts.

---

## 7. Production Build & Deployment

### Build Verification
```bash
npm run build
```

### Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. Import project in [Vercel](https://vercel.com).
3. Set environment variables:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN`
4. Click **Deploy**.

---

## 8. License & Honor Code
UniMate is built under the MIT License for university communities. Adheres to academic integrity standards and student privacy guidelines.
