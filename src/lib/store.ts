'use client';

import { 
  Profile, 
  Department, 
  Subject, 
  Question, 
  Answer, 
  Comment, 
  Post, 
  LostFoundItem, 
  PastPaper, 
  Scholarship, 
  Bookmark, 
  Conversation, 
  Message, 
  Notification, 
  Report, 
  SystemSettings 
} from '@/types/database';
import { 
  INITIAL_SETTINGS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_SUBJECTS, 
  INITIAL_QUESTIONS, 
  INITIAL_ANSWERS, 
  INITIAL_POSTS, 
  INITIAL_LOST_FOUND, 
  INITIAL_PAST_PAPERS, 
  INITIAL_SCHOLARSHIPS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REPORTS, 
  INITIAL_BOOKMARKS, 
  INITIAL_PROFILES 
} from './mock-data';
import { createClient, isSupabaseConfigured } from './supabase/client';

export class UniMateStore {
  private static listeners: Set<() => void> = new Set();
  private static isInitialized = false;
  private static isFetching = false;

  // Active in-memory state (Clean collections, zero dummy mock user records)
  private static settings: SystemSettings = INITIAL_SETTINGS;
  private static profiles: Profile[] = [...INITIAL_PROFILES];
  private static departments: Department[] = [...INITIAL_DEPARTMENTS];
  private static subjects: Subject[] = [...INITIAL_SUBJECTS];
  private static questions: Question[] = [...INITIAL_QUESTIONS];
  private static answers: Answer[] = [...INITIAL_ANSWERS];
  private static comments: Comment[] = [];
  private static posts: Post[] = [...INITIAL_POSTS];
  private static lostFound: LostFoundItem[] = [...INITIAL_LOST_FOUND];
  private static pastPapers: PastPaper[] = [...INITIAL_PAST_PAPERS];
  private static scholarships: Scholarship[] = [...INITIAL_SCHOLARSHIPS];
  private static bookmarks: Bookmark[] = [...INITIAL_BOOKMARKS];
  private static conversations: Conversation[] = [...INITIAL_CONVERSATIONS];
  private static messages: Message[] = [...INITIAL_MESSAGES];
  private static notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  private static reports: Report[] = [...INITIAL_REPORTS];

  public static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    if (!this.isInitialized) {
      this.init();
    }
    return () => this.listeners.delete(listener);
  }

  private static persistOfflineCache(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('unimate_offline_store', JSON.stringify({
        questions: this.questions,
        pastPapers: this.pastPapers,
        lostFound: this.lostFound,
        posts: this.posts,
        bookmarks: this.bookmarks,
        departments: this.departments,
        subjects: this.subjects,
        timestamp: Date.now()
      }));
    } catch (e) {}
  }

  private static notify(): void {
    this.persistOfflineCache();
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  // --- INITIALIZATION & SUPABASE SYNC ---
  public static async init(): Promise<void> {
    if (this.isFetching) return;
    this.isFetching = true;
    this.isInitialized = true;

    // 0. Restore offline cache immediately so app is instantly responsive offline
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('unimate_offline_store');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.questions?.length) this.questions = parsed.questions;
          if (parsed.pastPapers?.length) this.pastPapers = parsed.pastPapers;
          if (parsed.lostFound?.length) this.lostFound = parsed.lostFound;
          if (parsed.posts?.length) this.posts = parsed.posts;
          if (parsed.bookmarks?.length) this.bookmarks = parsed.bookmarks;
          if (parsed.departments?.length) this.departments = parsed.departments;
          if (parsed.subjects?.length) this.subjects = parsed.subjects;
        }
      } catch (e) {}
    }

    if (!isSupabaseConfigured()) {
      this.isFetching = false;
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      this.isFetching = false;
      return;
    }

    try {
      // 1. Fetch System Settings
      const { data: dbSettings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (dbSettings) {
        this.settings = { ...this.settings, ...dbSettings };
      }

      // 2. Fetch Departments
      const { data: dbDepts } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (dbDepts && dbDepts.length > 0) {
        this.departments = dbDepts as Department[];
      } else {
        // Auto-seed initial departments in Supabase if table is empty
        this.seedInitialDepartments(supabase);
      }

      // 3. Fetch Subjects
      const { data: dbSubjects } = await supabase
        .from('subjects')
        .select('*, departments(name), semesters(number)')
        .order('name');
      if (dbSubjects && dbSubjects.length > 0) {
        this.subjects = dbSubjects.map((s: any) => ({
          id: s.id,
          department_id: s.department_id,
          department_name: s.departments?.name,
          semester_id: s.semester_id,
          semester_number: s.semesters?.number,
          name: s.name,
          code: s.code,
          description: s.description || '',
          credits: s.credits || 3
        }));
      }

      // 4. Fetch Profiles
      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*, departments(name)');
      if (dbProfiles) {
        this.profiles = dbProfiles.map((p: any) => ({
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          role: p.role,
          department_id: p.department_id,
          department_name: p.departments?.name,
          program: p.program,
          semester: p.semester,
          avatar_url: p.avatar_url,
          bio: p.bio,
          student_id: p.student_id,
          is_suspended: p.is_suspended || false,
          created_at: p.created_at,
          updated_at: p.updated_at
        }));
      }

      // 5. Fetch Questions (joined with author profile, department, subject, answers count)
      const { data: dbQuestions } = await supabase
        .from('questions')
        .select('*, profiles:author_id(full_name, avatar_url, department_id), departments(name), subjects(name), answers(count)')
        .order('created_at', { ascending: false });
      if (dbQuestions) {
        this.questions = dbQuestions.map((q: any) => ({
          id: q.id,
          author_id: q.author_id,
          author_name: q.profiles?.full_name || 'Student',
          author_avatar: q.profiles?.avatar_url,
          author_department: q.departments?.name,
          department_id: q.department_id,
          department_name: q.departments?.name || 'Department',
          subject_id: q.subject_id,
          subject_name: q.subjects?.name,
          title: q.title,
          description: q.description,
          tags: q.tags || [],
          image_url: q.image_url,
          upvotes: q.upvotes || 0,
          views: q.views || 0,
          answers_count: q.answers?.[0]?.count || 0,
          accepted_answer_id: q.accepted_answer_id,
          is_resolved: q.is_resolved || false,
          created_at: q.created_at,
          updated_at: q.updated_at
        }));
      }

      // 6. Fetch Answers
      const { data: dbAnswers } = await supabase
        .from('answers')
        .select('*, profiles:author_id(full_name, avatar_url)')
        .order('created_at', { ascending: true });
      if (dbAnswers) {
        this.answers = dbAnswers.map((a: any) => ({
          id: a.id,
          question_id: a.question_id,
          author_id: a.author_id,
          author_name: a.profiles?.full_name || 'Student',
          author_avatar: a.profiles?.avatar_url,
          content: a.content,
          image_url: a.image_url,
          upvotes: a.upvotes || 0,
          is_accepted: a.is_accepted || false,
          comments: [],
          created_at: a.created_at
        }));
      }

      // 7. Fetch Comments
      const { data: dbComments } = await supabase
        .from('comments')
        .select('*, profiles:author_id(full_name, avatar_url)')
        .order('created_at', { ascending: true });
      if (dbComments) {
        this.comments = dbComments.map((c: any) => ({
          id: c.id,
          parent_type: c.parent_type,
          parent_id: c.parent_id,
          author_id: c.author_id,
          author_name: c.profiles?.full_name || 'Student',
          author_avatar: c.profiles?.avatar_url,
          content: c.content,
          created_at: c.created_at
        }));

        // Link comments to answers
        this.answers.forEach((ans) => {
          ans.comments = this.comments.filter((c) => c.parent_type === 'answer' && c.parent_id === ans.id);
        });
      }

      // 8. Fetch Posts (Community discussions)
      const { data: dbPosts } = await supabase
        .from('posts')
        .select('*, profiles:author_id(full_name, avatar_url, role)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (dbPosts) {
        this.posts = dbPosts.map((p: any) => ({
          id: p.id,
          author_id: p.author_id,
          author_name: p.profiles?.full_name || 'Student',
          author_avatar: p.profiles?.avatar_url,
          author_role: p.profiles?.role || 'student',
          category: p.category,
          title: p.title,
          content: p.content,
          image_url: p.image_url,
          tags: p.tags || [],
          likes: p.likes || 0,
          comments_count: this.comments.filter((c) => c.parent_type === 'post' && c.parent_id === p.id).length,
          comments: this.comments.filter((c) => c.parent_type === 'post' && c.parent_id === p.id),
          is_pinned: p.is_pinned || false,
          created_at: p.created_at
        }));
      }

      // 9. Fetch Lost & Found Items
      const { data: dbLostFound } = await supabase
        .from('lost_found_items')
        .select('*, profiles:author_id(full_name, avatar_url, email)')
        .order('created_at', { ascending: false });
      if (dbLostFound) {
        this.lostFound = dbLostFound.map((i: any) => ({
          id: i.id,
          author_id: i.author_id,
          author_name: i.profiles?.full_name || 'Student',
          author_avatar: i.profiles?.avatar_url,
          author_email: i.profiles?.email,
          type: i.type,
          category: i.category,
          title: i.title,
          description: i.description,
          location: i.location,
          event_date: i.event_date,
          image_url: i.image_url,
          contact_info: i.contact_info,
          contact_preference: i.contact_preference || 'in_app',
          status: i.status || 'open',
          resolved_date: i.resolved_date,
          created_at: i.created_at
        }));
      }

      // 10. Fetch Past Papers
      const { data: dbPastPapers } = await supabase
        .from('past_papers')
        .select('*, profiles:uploader_id(full_name), departments(name), subjects(name, code), semesters(number)')
        .order('created_at', { ascending: false });
      if (dbPastPapers) {
        this.pastPapers = dbPastPapers.map((p: any) => ({
          id: p.id,
          uploader_id: p.uploader_id,
          uploader_name: p.profiles?.full_name || 'Campus Student',
          department_id: p.department_id,
          department_name: p.departments?.name || 'Department',
          subject_id: p.subject_id,
          subject_name: p.subjects?.name || 'Subject',
          subject_code: p.subjects?.code || 'SUBJ',
          semester_number: p.semesters?.number || 1,
          year: p.year,
          exam_type: p.exam_type,
          title: p.title,
          file_url: p.file_url,
          file_name: p.file_name,
          file_size_kb: p.file_size_kb || 0,
          downloads: p.downloads || 0,
          status: p.status || 'pending',
          created_at: p.created_at
        }));
      }

      // 11. Fetch Scholarships
      const { data: dbScholarships } = await supabase
        .from('scholarships')
        .select('*')
        .order('deadline', { ascending: true });
      if (dbScholarships) {
        this.scholarships = dbScholarships as Scholarship[];
      }

      // 12. Fetch Bookmarks
      const { data: dbBookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbBookmarks) {
        this.bookmarks = dbBookmarks as Bookmark[];
      }

      // 13. Fetch Notifications
      const { data: dbNotifications } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbNotifications) {
        this.notifications = dbNotifications as Notification[];
      }

      // 14. Fetch Reports
      const { data: dbReports } = await supabase
        .from('reports')
        .select('*, profiles:reporter_id(full_name)')
        .order('created_at', { ascending: false });
      if (dbReports) {
        this.reports = dbReports.map((r: any) => ({
          id: r.id,
          reporter_id: r.reporter_id,
          reporter_name: r.profiles?.full_name || 'Student Reporter',
          item_type: r.item_type,
          item_id: r.item_id,
          item_title: `${r.item_type.toUpperCase()} #${r.item_id.slice(0, 8)}`,
          reason: r.reason,
          details: r.details,
          status: r.status,
          admin_notes: r.admin_notes,
          created_at: r.created_at,
          resolved_at: r.resolved_at
        }));
      }

      // 15. Fetch Conversations & Messages
      const { data: dbConversations } = await supabase
        .from('conversations')
        .select('*, conversation_members(user_id)')
        .order('updated_at', { ascending: false });
      if (dbConversations) {
        this.conversations = dbConversations.map((c: any) => {
          const memberIds = (c.conversation_members || []).map((m: any) => m.user_id);
          const members = this.profiles.filter((p) => memberIds.includes(p.id));
          return {
            id: c.id,
            participant_ids: memberIds,
            participants: members,
            unread_count: 0,
            updated_at: c.updated_at
          };
        });
      }

      const { data: dbMessages } = await supabase
        .from('messages')
        .select('*, profiles:sender_id(full_name, avatar_url)')
        .order('created_at', { ascending: true });
      if (dbMessages) {
        this.messages = dbMessages.map((m: any) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          sender_name: m.profiles?.full_name || 'Student',
          sender_avatar: m.profiles?.avatar_url,
          content: m.content,
          created_at: m.created_at,
          is_read: m.is_read || false
        }));
      }

      this.notify();
    } catch (err) {
      console.error('Error during Supabase sync:', err);
    } finally {
      this.isFetching = false;
    }
  }

  private static async seedInitialDepartments(supabase: any): Promise<void> {
    try {
      const deptsToSeed = INITIAL_DEPARTMENTS.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description
      }));
      await supabase.from('departments').upsert(deptsToSeed, { onConflict: 'code' });
      const { data } = await supabase.from('departments').select('*');
      if (data) {
        this.departments = data as Department[];
        this.notify();
      }
    } catch (e) {
      console.warn('Auto-seed departments skipped:', e);
    }
  }

  // --- SETTINGS ---
  public static getSettings(): SystemSettings {
    return this.settings;
  }

  public static updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...updates, updated_at: new Date().toISOString() };
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('system_settings').update(updates).eq('id', 1).then(({ error }) => {
        if (error) console.error('Error updating system settings in Supabase:', error);
      });
    }
    return this.settings;
  }

  // --- PROFILES & USERS ---
  public static getProfiles(): Profile[] {
    return this.profiles;
  }

  public static getProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public static saveProfile(profile: Profile): void {
    const idx = this.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      this.profiles[idx] = { ...this.profiles[idx], ...profile, updated_at: new Date().toISOString() };
    } else {
      this.profiles.push({ ...profile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('profiles').upsert(profile).then(({ error }) => {
        if (error) console.error('Error saving profile in Supabase:', error);
      });
    }
  }

  public static toggleUserSuspension(userId: string): boolean {
    const user = this.profiles.find((p) => p.id === userId);
    if (!user) return false;
    user.is_suspended = !user.is_suspended;
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('profiles').update({ is_suspended: user.is_suspended }).eq('id', userId).then(({ error }) => {
        if (error) console.error('Error toggling suspension in Supabase:', error);
      });
    }
    return user.is_suspended;
  }

  // --- DEPARTMENTS & SUBJECTS ---
  public static getDepartments(): Department[] {
    return this.departments;
  }

  public static addDepartment(dept: Omit<Department, 'id'>): Department {
    const newDept: Department = {
      id: 'd_' + Date.now(),
      ...dept
    };
    this.departments.push(newDept);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('departments').insert({
        name: dept.name,
        code: dept.code,
        description: dept.description
      }).select().single().then(({ data, error }) => {
        if (data) {
          newDept.id = data.id;
          this.notify();
        }
        if (error) console.error('Error adding department to Supabase:', error);
      });
    }
    return newDept;
  }

  public static getSubjects(): Subject[] {
    return this.subjects;
  }

  public static addSubject(subject: Omit<Subject, 'id'>): Subject {
    const newSubj: Subject = {
      id: 'subj_' + Date.now(),
      ...subject
    };
    this.subjects.push(newSubj);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('subjects').insert({
        department_id: subject.department_id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        credits: subject.credits || 3
      }).select().single().then(({ data, error }) => {
        if (data) {
          newSubj.id = data.id;
          this.notify();
        }
        if (error) console.error('Error adding subject to Supabase:', error);
      });
    }
    return newSubj;
  }

  // --- QUESTIONS & ANSWERS ---
  public static getQuestions(): Question[] {
    return this.questions;
  }

  public static getQuestionById(id: string): Question | undefined {
    return this.questions.find((q) => q.id === id);
  }

  public static createQuestion(data: {
    author: Profile;
    department_id: string;
    department_name: string;
    subject_id?: string;
    subject_name?: string;
    title: string;
    description: string;
    tags: string[];
    image_url?: string;
  }): Question {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'q_' + Date.now();
    const newQ: Question = {
      id: tempId,
      author_id: data.author.id,
      author_name: data.author.full_name,
      author_avatar: data.author.avatar_url,
      author_department: data.author.department_name,
      department_id: data.department_id,
      department_name: data.department_name,
      subject_id: data.subject_id,
      subject_name: data.subject_name,
      title: data.title,
      description: data.description,
      tags: data.tags,
      image_url: data.image_url,
      upvotes: 0,
      views: 1,
      answers_count: 0,
      is_resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.questions.unshift(newQ);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('questions').insert({
        author_id: data.author.id,
        department_id: data.department_id,
        subject_id: data.subject_id || null,
        title: data.title,
        description: data.description,
        tags: data.tags,
        image_url: data.image_url || null
      }).select().single().then(({ data: created, error }) => {
        if (created) {
          newQ.id = created.id;
          this.notify();
        }
        if (error) console.error('Error inserting question into Supabase:', error);
      });
    }
    return newQ;
  }

  public static voteQuestion(questionId: string, direction: 'up' | 'down'): Question | undefined {
    const q = this.questions.find((item) => item.id === questionId);
    if (!q) return undefined;

    if (q.user_voted === direction) {
      q.upvotes += direction === 'up' ? -1 : 1;
      q.user_voted = null;
    } else {
      const delta = q.user_voted ? (direction === 'up' ? 2 : -2) : (direction === 'up' ? 1 : -1);
      q.upvotes += delta;
      q.user_voted = direction;
    }
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('questions').update({ upvotes: q.upvotes }).eq('id', questionId).then(({ error }) => {
        if (error) console.error('Error voting on question in Supabase:', error);
      });
    }
    return q;
  }

  public static deleteQuestion(id: string): void {
    this.questions = this.questions.filter((q) => q.id !== id);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('questions').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting question in Supabase:', error);
      });
    }
  }

  public static getAnswers(questionId: string): Answer[] {
    return this.answers.filter((a) => a.question_id === questionId);
  }

  public static addAnswer(data: {
    question_id: string;
    author: Profile;
    content: string;
    image_url?: string;
  }): Answer {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ans_' + Date.now();
    const newAnswer: Answer = {
      id: tempId,
      question_id: data.question_id,
      author_id: data.author.id,
      author_name: data.author.full_name,
      author_avatar: data.author.avatar_url,
      author_department: data.author.department_name,
      content: data.content,
      image_url: data.image_url,
      upvotes: 0,
      is_accepted: false,
      comments: [],
      created_at: new Date().toISOString()
    };
    this.answers.push(newAnswer);

    const q = this.questions.find((item) => item.id === data.question_id);
    if (q) {
      q.answers_count = (q.answers_count || 0) + 1;
    }
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('answers').insert({
        question_id: data.question_id,
        author_id: data.author.id,
        content: data.content,
        image_url: data.image_url || null
      }).select().single().then(({ data: created, error }) => {
        if (created) {
          newAnswer.id = created.id;
          this.notify();
        }
        if (error) console.error('Error inserting answer into Supabase:', error);
      });
    }
    return newAnswer;
  }

  public static voteAnswer(answerId: string, direction: 'up' | 'down'): Answer | undefined {
    const ans = this.answers.find((a) => a.id === answerId);
    if (!ans) return undefined;

    if (ans.user_voted === direction) {
      ans.upvotes += direction === 'up' ? -1 : 1;
      ans.user_voted = null;
    } else {
      const delta = ans.user_voted ? (direction === 'up' ? 2 : -2) : (direction === 'up' ? 1 : -1);
      ans.upvotes += delta;
      ans.user_voted = direction;
    }
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('answers').update({ upvotes: ans.upvotes }).eq('id', answerId).then(({ error }) => {
        if (error) console.error('Error voting on answer in Supabase:', error);
      });
    }
    return ans;
  }

  public static acceptAnswer(questionId: string, answerId: string): void {
    const q = this.questions.find((item) => item.id === questionId);
    if (!q) return;

    this.answers.forEach((a) => {
      if (a.question_id === questionId) {
        a.is_accepted = a.id === answerId;
      }
    });

    q.accepted_answer_id = answerId;
    q.is_resolved = true;
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('answers').update({ is_accepted: false }).eq('question_id', questionId).then(() => {
        supabase.from('answers').update({ is_accepted: true }).eq('id', answerId);
      });
      supabase.from('questions').update({ accepted_answer_id: answerId, is_resolved: true }).eq('id', questionId);
    }
  }

  public static addComment(data: {
    parent_type: 'question' | 'answer' | 'post';
    parent_id: string;
    author: Profile;
    content: string;
  }): Comment {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'comm_' + Date.now();
    const newComment: Comment = {
      id: tempId,
      parent_type: data.parent_type,
      parent_id: data.parent_id,
      author_id: data.author.id,
      author_name: data.author.full_name,
      author_avatar: data.author.avatar_url,
      content: data.content,
      created_at: new Date().toISOString()
    };
    this.comments.push(newComment);

    if (data.parent_type === 'answer') {
      const ans = this.answers.find((a) => a.id === data.parent_id);
      if (ans) {
        ans.comments = ans.comments || [];
        ans.comments.push(newComment);
      }
    } else if (data.parent_type === 'post') {
      const p = this.posts.find((item) => item.id === data.parent_id);
      if (p) {
        p.comments = p.comments || [];
        p.comments.push(newComment);
        p.comments_count = p.comments.length;
      }
    }
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('comments').insert({
        parent_type: data.parent_type,
        parent_id: data.parent_id,
        author_id: data.author.id,
        content: data.content
      }).select().single().then(({ data: created, error }) => {
        if (created) {
          newComment.id = created.id;
          this.notify();
        }
        if (error) console.error('Error inserting comment into Supabase:', error);
      });
    }
    return newComment;
  }

  // --- COMMUNITY POSTS ---
  public static getPosts(filterRole?: string, currentUserId?: string): Post[] {
    if (filterRole === 'admin') {
      return this.posts;
    }
    return this.posts.filter((p) => p.status === 'approved' || !p.status || p.author_id === currentUserId);
  }

  public static setPostStatus(postId: string, status: 'approved' | 'rejected'): void {
    const p = this.posts.find((item) => item.id === postId);
    if (!p) return;
    p.status = status;
    this.notify();

    // Send notification to the post author
    this.addNotification({
      user_id: p.author_id,
      type: 'report_status',
      title: status === 'approved' ? '✅ Post Approved & Published' : '⚠️ Post Moderation Notice',
      message: status === 'approved'
        ? `Your post "${p.title}" was approved by Ahmad Khan and is now published live on Campus Feed.`
        : `Your post "${p.title}" was reviewed and declined by the moderation team.`,
      link: '/community'
    });

    const supabase = createClient();
    if (supabase) {
      supabase.from('posts').update({ status }).eq('id', postId).then(({ error }) => {
        if (error) console.error('Error updating post status in Supabase:', error);
      });
    }
  }

  public static createPost(data: {
    author: Profile;
    category: Post['category'];
    title: string;
    content: string;
    tags: string[];
    image_url?: string;
  }): Post {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'post_' + Date.now();
    const isApproved = data.author.role === 'admin';
    const newPost: Post = {
      id: tempId,
      author_id: data.author.id,
      author_name: data.author.full_name,
      author_avatar: data.author.avatar_url,
      author_role: data.author.role,
      category: data.category,
      title: data.title,
      content: data.content,
      tags: data.tags,
      image_url: data.image_url,
      likes: 0,
      comments_count: 0,
      comments: [],
      status: isApproved ? 'approved' : 'pending',
      created_at: new Date().toISOString()
    };
    this.posts.unshift(newPost);
    this.notify();

    // If student post is pending, trigger an admin notification
    if (!isApproved) {
      this.addNotification({
        user_id: 'admin-ahmad-khan-2026',
        type: 'report_status',
        title: '🔔 Student Post Awaiting Admin Approval',
        message: `"${data.title}" submitted by ${data.author.full_name} is awaiting moderation.`,
        link: '/admin'
      });
    }

    const supabase = createClient();
    if (supabase) {
      supabase.from('posts').insert({
        author_id: data.author.id,
        category: data.category,
        title: data.title,
        content: data.content,
        image_url: data.image_url || null,
        tags: data.tags,
        status: newPost.status
      }).select().single().then(({ data: created, error }) => {
        if (created) {
          newPost.id = created.id;
          this.notify();
        }
        if (error) console.error('Error inserting post into Supabase:', error);
      });
    }
    return newPost;
  }

  public static toggleLikePost(postId: string): Post | undefined {
    const p = this.posts.find((item) => item.id === postId);
    if (!p) return undefined;
    p.user_liked = !p.user_liked;
    p.likes += p.user_liked ? 1 : -1;
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('posts').update({ likes: p.likes }).eq('id', postId).then(({ error }) => {
        if (error) console.error('Error updating post likes in Supabase:', error);
      });
    }
    return p;
  }

  // --- LOST & FOUND ---
  public static getLostFoundItems(): LostFoundItem[] {
    return this.lostFound;
  }

  public static getLostFoundById(id: string): LostFoundItem | undefined {
    return this.lostFound.find((item) => item.id === id);
  }

  public static createLostFoundItem(data: {
    author: Profile;
    type: 'lost' | 'found';
    category: LostFoundItem['category'];
    title: string;
    description: string;
    location: string;
    event_date: string;
    contact_info: string;
    contact_preference: 'email' | 'phone' | 'in_app';
    image_url?: string;
  }): LostFoundItem {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'lf_' + Date.now();
    const newItem: LostFoundItem = {
      id: tempId,
      author_id: data.author.id,
      author_name: data.author.full_name,
      author_avatar: data.author.avatar_url,
      author_email: data.author.email,
      type: data.type,
      category: data.category,
      title: data.title,
      description: data.description,
      location: data.location,
      event_date: data.event_date,
      contact_info: data.contact_info,
      contact_preference: data.contact_preference,
      image_url: data.image_url,
      status: 'open',
      created_at: new Date().toISOString()
    };
    this.lostFound.unshift(newItem);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('lost_found_items').insert({
        author_id: data.author.id,
        type: data.type,
        category: data.category,
        title: data.title,
        description: data.description,
        location: data.location,
        event_date: data.event_date,
        contact_info: data.contact_info,
        contact_preference: data.contact_preference,
        image_url: data.image_url || null,
        status: 'open'
      }).select().single().then(({ data: created, error }) => {
        if (created) {
          newItem.id = created.id;
          this.notify();
        }
        if (error) console.error('Error creating lost/found item in Supabase:', error);
      });
    }
    return newItem;
  }

  public static markLostFoundResolved(itemId: string): LostFoundItem | undefined {
    const item = this.lostFound.find((i) => i.id === itemId);
    if (!item) return undefined;
    item.status = 'resolved';
    item.resolved_date = new Date().toISOString();
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('lost_found_items').update({
        status: 'resolved',
        resolved_date: item.resolved_date
      }).eq('id', itemId).then(({ error }) => {
        if (error) console.error('Error resolving lost/found in Supabase:', error);
      });
    }
    return item;
  }

  // --- PAST PAPERS ---
  public static getPastPapers(): PastPaper[] {
    return this.pastPapers;
  }

  public static uploadPastPaper(data: {
    uploader: Profile;
    department_id: string;
    department_name: string;
    subject_id: string;
    subject_name: string;
    subject_code: string;
    semester_number: number;
    year: number;
    exam_type: PastPaper['exam_type'];
    title: string;
    file_name: string;
    file_size_kb: number;
  }): PastPaper {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'pp_' + Date.now();
    const newPaper: PastPaper = {
      id: tempId,
      uploader_id: data.uploader.id,
      uploader_name: data.uploader.full_name,
      department_id: data.department_id,
      department_name: data.department_name,
      subject_id: data.subject_id,
      subject_name: data.subject_name,
      subject_code: data.subject_code,
      semester_number: data.semester_number,
      year: data.year,
      exam_type: data.exam_type,
      title: data.title,
      file_url: '/sample-papers/CS201_Midterm_2025.pdf',
      file_name: data.file_name,
      file_size_kb: data.file_size_kb,
      downloads: 0,
      status: data.uploader.role === 'admin' ? 'approved' : 'pending',
      created_at: new Date().toISOString()
    };
    this.pastPapers.unshift(newPaper);
    this.notify();

    // If student paper is pending, notify admin
    if (newPaper.status === 'pending') {
      this.addNotification({
        user_id: 'admin-ahmad-khan-2026',
        type: 'report_status',
        title: '📄 Exam Paper Verification Required',
        message: `${data.uploader.full_name} submitted "${data.title}" for campus library moderation.`,
        link: '/admin'
      });
    }

    const supabase = createClient();
    if (supabase) {
      supabase.from('past_papers').insert({
        uploader_id: data.uploader.id,
        department_id: data.department_id,
        subject_id: data.subject_id,
        year: data.year,
        exam_type: data.exam_type,
        title: data.title,
        file_url: newPaper.file_url,
        file_name: data.file_name,
        file_size_kb: data.file_size_kb,
        status: newPaper.status
      }).select().single().then(({ data: created, error }) => {
        if (created) {
          newPaper.id = created.id;
          this.notify();
        }
        if (error) console.error('Error uploading past paper to Supabase:', error);
      });
    }
    return newPaper;
  }

  public static setPastPaperStatus(paperId: string, status: 'approved' | 'rejected'): void {
    const p = this.pastPapers.find((item) => item.id === paperId);
    if (!p) return;
    p.status = status;
    this.notify();

    // Notify uploader of decision
    this.addNotification({
      user_id: p.uploader_id,
      type: 'report_status',
      title: status === 'approved' ? '✅ Past Paper Approved!' : '⚠️ Past Paper Moderation Notice',
      message: status === 'approved'
        ? `Your exam paper "${p.title}" was approved by Ahmad Khan and is now available in the Past Papers Library.`
        : `Your exam paper "${p.title}" was reviewed and declined.`,
      link: '/past-papers'
    });

    const supabase = createClient();
    if (supabase) {
      supabase.from('past_papers').update({ status }).eq('id', paperId).then(({ error }) => {
        if (error) console.error('Error updating past paper status in Supabase:', error);
      });
    }
  }

  public static incrementDownload(paperId: string): void {
    const p = this.pastPapers.find((item) => item.id === paperId);
    if (p) {
      p.downloads = (p.downloads || 0) + 1;
      this.notify();

      const supabase = createClient();
      if (supabase) {
        supabase.from('past_papers').update({ downloads: p.downloads }).eq('id', paperId);
      }
    }
  }

  // --- SCHOLARSHIPS & OPPORTUNITIES ---
  public static getScholarships(): Scholarship[] {
    return this.scholarships;
  }

  public static createScholarship(data: Omit<Scholarship, 'id' | 'created_at' | 'is_verified'> & { author?: Profile }): Scholarship {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sch_' + Date.now();
    const newSch: Scholarship = {
      id: tempId,
      ...data,
      is_verified: data.author?.role === 'admin',
      created_at: new Date().toISOString()
    };
    this.scholarships.unshift(newSch);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('scholarships').insert({
        author_id: data.author?.id || null,
        title: data.title,
        organization: data.organization,
        description: data.description,
        category: data.category,
        eligibility: data.eligibility,
        deadline: data.deadline,
        application_url: data.application_url,
        image_url: data.image_url || null,
        department_eligibility: data.department_eligibility || [],
        status: data.status,
        amount: data.amount || null,
        location: data.location || null,
        is_verified: newSch.is_verified
      }).select().single().then(({ data: created, error }) => {
        if (created) {
          newSch.id = created.id;
          this.notify();
        }
        if (error) console.error('Error creating scholarship in Supabase:', error);
      });
    }
    return newSch;
  }

  public static verifyScholarship(id: string): void {
    const sch = this.scholarships.find((s) => s.id === id);
    if (sch) {
      sch.is_verified = true;
      this.notify();

      const supabase = createClient();
      if (supabase) {
        supabase.from('scholarships').update({ is_verified: true }).eq('id', id);
      }
    }
  }

  // --- BOOKMARKS ---
  public static getBookmarks(userId: string): Bookmark[] {
    return this.bookmarks.filter((b) => b.user_id === userId);
  }

  public static isBookmarked(userId: string, itemType: Bookmark['item_type'], itemId: string): boolean {
    return this.bookmarks.some((b) => b.user_id === userId && b.item_type === itemType && b.item_id === itemId);
  }

  public static toggleBookmark(data: {
    user_id: string;
    item_type: Bookmark['item_type'];
    item_id: string;
    title: string;
    category?: string;
    link: string;
  }): boolean {
    const existingIdx = this.bookmarks.findIndex(
      (b) => b.user_id === data.user_id && b.item_type === data.item_type && b.item_id === data.item_id
    );

    const supabase = createClient();

    if (existingIdx >= 0) {
      this.bookmarks.splice(existingIdx, 1);
      this.notify();

      if (supabase) {
        supabase.from('bookmarks').delete().match({
          user_id: data.user_id,
          item_type: data.item_type,
          item_id: data.item_id
        });
      }
      return false;
    } else {
      const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'bm_' + Date.now();
      const newBm: Bookmark = {
        id: tempId,
        user_id: data.user_id,
        item_type: data.item_type,
        item_id: data.item_id,
        title: data.title,
        category: data.category,
        link: data.link,
        created_at: new Date().toISOString()
      };
      this.bookmarks.unshift(newBm);
      this.notify();

      if (supabase) {
        supabase.from('bookmarks').insert({
          user_id: data.user_id,
          item_type: data.item_type,
          item_id: data.item_id
        }).select().single().then(({ data: created }) => {
          if (created) newBm.id = created.id;
        });
      }
      return true;
    }
  }

  // --- MESSAGES & CONVERSATIONS ---
  public static getConversations(userId: string): Conversation[] {
    return this.conversations.filter((c) => c.participant_ids.includes(userId));
  }

  public static getMessages(conversationId: string): Message[] {
    return this.messages.filter((m) => m.conversation_id === conversationId);
  }

  public static sendMessage(data: {
    conversation_id: string;
    sender: Profile;
    content: string;
  }): Message {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'msg_' + Date.now();
    const newMsg: Message = {
      id: tempId,
      conversation_id: data.conversation_id,
      sender_id: data.sender.id,
      sender_name: data.sender.full_name,
      sender_avatar: data.sender.avatar_url,
      content: data.content,
      created_at: new Date().toISOString(),
      is_read: false
    };
    this.messages.push(newMsg);

    const conv = this.conversations.find((c) => c.id === data.conversation_id);
    if (conv) {
      conv.last_message = {
        content: data.content,
        sender_id: data.sender.id,
        created_at: newMsg.created_at
      };
      conv.updated_at = newMsg.created_at;
    }
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('messages').insert({
        conversation_id: data.conversation_id,
        sender_id: data.sender.id,
        content: data.content
      }).select().single().then(({ data: created, error }) => {
        if (created) newMsg.id = created.id;
        if (error) console.error('Error sending message in Supabase:', error);
      });
    }
    return newMsg;
  }

  public static startConversation(currentUser: Profile, targetUser: Profile): Conversation {
    let existing = this.conversations.find(
      (c) => c.participant_ids.includes(currentUser.id) && c.participant_ids.includes(targetUser.id)
    );

    if (!existing) {
      const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'conv_' + Date.now();
      existing = {
        id: tempId,
        participant_ids: [currentUser.id, targetUser.id],
        participants: [currentUser, targetUser],
        unread_count: 0,
        updated_at: new Date().toISOString()
      };
      this.conversations.unshift(existing);
      this.notify();

      const supabase = createClient();
      if (supabase) {
        supabase.from('conversations').insert({}).select().single().then(async ({ data: newConv }) => {
          if (newConv) {
            existing!.id = newConv.id;
            await supabase.from('conversation_members').insert([
              { conversation_id: newConv.id, user_id: currentUser.id },
              { conversation_id: newConv.id, user_id: targetUser.id }
            ]);
            this.notify();
          }
        });
      }
    }
    return existing;
  }

  // --- NOTIFICATIONS ---
  public static getNotifications(userId: string): Notification[] {
    const profile = this.profiles.find((p) => p.id === userId);
    const isAdmin = userId === 'admin-ahmad-khan-2026' || profile?.role === 'admin';
    return this.notifications.filter(
      (n) => n.user_id === userId || (isAdmin && (n.user_id === 'admin-ahmad-khan-2026' || n.user_id === 'admin'))
    );
  }

  public static addNotification(data: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Notification {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'notif_' + Date.now();
    const newNotif: Notification = {
      id: tempId,
      ...data,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('notifications').insert({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link
      }).select().single().then(({ data: created }) => {
        if (created) newNotif.id = created.id;
      });
    }
    return newNotif;
  }

  public static markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.notify();

      const supabase = createClient();
      if (supabase) {
        supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
    }
  }

  public static markAllNotificationsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    }
  }

  // --- REPORTS & MODERATION ---
  public static getReports(): Report[] {
    return this.reports;
  }

  public static submitReport(data: {
    reporter: Profile;
    item_type: Report['item_type'];
    item_id: string;
    item_title?: string;
    reason: Report['reason'];
    details: string;
  }): Report {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'rep_' + Date.now();
    const newRep: Report = {
      id: tempId,
      reporter_id: data.reporter.id,
      reporter_name: data.reporter.full_name,
      item_type: data.item_type,
      item_id: data.item_id,
      item_title: data.item_title,
      reason: data.reason,
      details: data.details,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.reports.unshift(newRep);
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('reports').insert({
        reporter_id: data.reporter.id,
        item_type: data.item_type,
        item_id: data.item_id,
        reason: data.reason,
        details: data.details,
        status: 'pending'
      }).select().single().then(({ data: created, error }) => {
        if (created) newRep.id = created.id;
        if (error) console.error('Error submitting report to Supabase:', error);
      });
    }
    return newRep;
  }

  public static resolveReport(reportId: string, status: 'resolved' | 'dismissed', adminNotes?: string): void {
    const rep = this.reports.find((r) => r.id === reportId);
    if (!rep) return;
    rep.status = status;
    rep.admin_notes = adminNotes;
    rep.resolved_at = new Date().toISOString();
    this.notify();

    const supabase = createClient();
    if (supabase) {
      supabase.from('reports').update({
        status,
        admin_notes: adminNotes,
        resolved_at: rep.resolved_at
      }).eq('id', reportId);
    }
  }

  // --- PLATFORM STATS ---
  public static getStats() {
    return {
      totalStudents: this.profiles.filter((p) => p.role === 'student').length,
      activeQuestions: this.questions.length,
      totalAnswers: this.answers.length,
      lostItems: this.lostFound.filter((i) => i.type === 'lost').length,
      foundItems: this.lostFound.filter((i) => i.type === 'found').length,
      pastPapersCount: this.pastPapers.filter((p) => p.status === 'approved').length,
      pendingPapers: this.pastPapers.filter((p) => p.status === 'pending').length,
      pendingPosts: this.posts.filter((p) => p.status === 'pending').length,
      totalPosts: this.posts.filter((p) => p.status === 'approved' || !p.status).length,
      activeScholarships: this.scholarships.filter((s) => s.status !== 'closed').length,
      pendingReports: this.reports.filter((r) => r.status === 'pending').length
    };
  }
}
