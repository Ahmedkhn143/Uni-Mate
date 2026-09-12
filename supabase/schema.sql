-- =====================================================================
-- UniMate: University Student Community Platform
-- Complete PostgreSQL Database Schema with Row Level Security (RLS)
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    department_id UUID,
    program TEXT,
    semester INT CHECK (semester >= 1 AND semester <= 12),
    student_id TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree_level TEXT NOT NULL CHECK (degree_level IN ('BS', 'MS', 'PhD')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SEMESTERS TABLE
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INT NOT NULL UNIQUE CHECK (number >= 1 AND number <= 12),
    name TEXT NOT NULL
);

-- 5. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    credits INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    upvotes INT NOT NULL DEFAULT 0,
    views INT NOT NULL DEFAULT 0,
    accepted_answer_id UUID,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    upvotes INT NOT NULL DEFAULT 0,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COMMENTS TABLE (Questions, Answers, Posts)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_type TEXT NOT NULL CHECK (parent_type IN ('question', 'answer', 'post')),
    parent_id UUID NOT NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. POSTS TABLE (Community discussions, study help, announcements)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('discussion', 'announcement', 'study_help', 'resource')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    likes INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. LOST AND FOUND TABLE
CREATE TABLE IF NOT EXISTS public.lost_found_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    category TEXT NOT NULL CHECK (category IN (
        'ID/Card', 'Wallet', 'Keys', 'Books', 'Electronics', 
        'Documents', 'Clothing', 'Accessories', 'Other'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    event_date DATE NOT NULL,
    image_url TEXT,
    contact_info TEXT NOT NULL,
    contact_preference TEXT NOT NULL DEFAULT 'in_app' CHECK (contact_preference IN ('email', 'phone', 'in_app')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    resolved_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PAST PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.past_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
    year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
    exam_type TEXT NOT NULL CHECK (exam_type IN ('midterm', 'final', 'quiz', 'assignment')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_kb INT NOT NULL DEFAULT 0,
    downloads INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SCHOLARSHIPS & OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Scholarship', 'Internship', 'Workshop', 'Competition', 'Fellowship', 'Job', 'Other'
    )),
    eligibility TEXT NOT NULL,
    deadline DATE NOT NULL,
    application_url TEXT NOT NULL,
    image_url TEXT,
    department_eligibility TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closing_soon', 'closed')),
    amount TEXT,
    location TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('question', 'paper', 'scholarship', 'post', 'lost_found')),
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, item_type, item_id)
);

-- 14. CONVERSATIONS & MESSAGING
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('answer', 'comment', 'accepted_answer', 'message', 'report_status', 'announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('question', 'answer', 'post', 'lost_found', 'paper', 'user')),
    item_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN (
        'spam', 'harassment', 'fake_information', 'inappropriate_content', 
        'copyright_issue', 'scam', 'other'
    )),
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 17. ADMIN AUDIT ACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    university_name TEXT NOT NULL DEFAULT 'Metropolitan University',
    allowed_email_domains TEXT[] NOT NULL DEFAULT ARRAY['student.edu', 'uni.edu'],
    allow_public_viewing BOOLEAN NOT NULL DEFAULT TRUE,
    max_upload_size_mb INT NOT NULL DEFAULT 25,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    announcement_banner TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND is_suspended = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins have full profile access" 
ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Departments, Programs, Semesters, Subjects: Publicly readable, Admin writeable
CREATE POLICY "Departments are readable by all" ON public.departments FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage departments" ON public.departments FOR ALL USING (public.is_admin());

CREATE POLICY "Programs are readable by all" ON public.programs FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage programs" ON public.programs FOR ALL USING (public.is_admin());

CREATE POLICY "Semesters are readable by all" ON public.semesters FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage semesters" ON public.semesters FOR ALL USING (public.is_admin());

CREATE POLICY "Subjects are readable by all" ON public.subjects FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage subjects" ON public.subjects FOR ALL USING (public.is_admin());

-- Questions Policies
CREATE POLICY "Questions are readable by all" 
ON public.questions FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create questions" 
ON public.questions FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = author_id AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_suspended = TRUE));

CREATE POLICY "Users can update their own questions or admins can moderate" 
ON public.questions FOR UPDATE TO authenticated 
USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Users can delete their own questions or admins can moderate" 
ON public.questions FOR DELETE TO authenticated 
USING (auth.uid() = author_id OR public.is_admin());

-- Answers Policies
CREATE POLICY "Answers are readable by all" 
ON public.answers FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert answers" 
ON public.answers FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = author_id AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_suspended = TRUE));

CREATE POLICY "Users can update own answers or admins can moderate" 
ON public.answers FOR UPDATE TO authenticated 
USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Users can delete own answers or admins can moderate" 
ON public.answers FOR DELETE TO authenticated 
USING (auth.uid() = author_id OR public.is_admin());

-- Lost & Found Policies
CREATE POLICY "Lost and found items are readable by all" 
ON public.lost_found_items FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can post lost/found" 
ON public.lost_found_items FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = author_id AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_suspended = TRUE));

CREATE POLICY "Users can update own lost/found item or admin" 
ON public.lost_found_items FOR UPDATE TO authenticated 
USING (auth.uid() = author_id OR public.is_admin());

-- Past Papers Policies
CREATE POLICY "Approved past papers readable by all; pending by admin or uploader" 
ON public.past_papers FOR SELECT 
USING (status = 'approved' OR auth.uid() = uploader_id OR public.is_admin());

CREATE POLICY "Authenticated users can upload past papers" 
ON public.past_papers FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = uploader_id AND status = 'pending');

CREATE POLICY "Admin can update or delete past papers" 
ON public.past_papers FOR ALL TO authenticated 
USING (public.is_admin());

-- Scholarships Policies
CREATE POLICY "Scholarships are viewable by all" 
ON public.scholarships FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can submit scholarships" 
ON public.scholarships FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can manage scholarships" 
ON public.scholarships FOR ALL TO authenticated 
USING (public.is_admin());

-- Bookmarks Policies
CREATE POLICY "Users can manage their own bookmarks" 
ON public.bookmarks FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can send messages to their conversations" 
ON public.messages FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    ) AND
    NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_suspended = TRUE)
);

-- Notifications Policies
CREATE POLICY "Users can view and update their own notifications" 
ON public.notifications FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Authenticated users can submit reports" 
ON public.reports FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage reports" 
ON public.reports FOR ALL TO authenticated 
USING (public.is_admin());

-- System Settings
CREATE POLICY "Settings are viewable by all" ON public.system_settings FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can update settings" ON public.system_settings FOR ALL USING (public.is_admin());

-- =====================================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
