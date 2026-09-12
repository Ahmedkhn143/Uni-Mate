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
  INITIAL_PROFILES, 
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
  INITIAL_SETTINGS 
} from './mock-data';

const STORAGE_PREFIX = 'unimate_v1_';

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed saving ${key} to localStorage:`, err);
  }
}

export class UniMateStore {
  private static listeners: Set<() => void> = new Set();

  public static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  // --- SETTINGS ---
  public static getSettings(): SystemSettings {
    return getStored('settings', INITIAL_SETTINGS);
  }

  public static updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    setStored('settings', updated);
    this.notify();
    return updated;
  }

  // --- PROFILES & USERS ---
  public static getProfiles(): Profile[] {
    return getStored('profiles', INITIAL_PROFILES);
  }

  public static getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  public static saveProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile, updated_at: new Date().toISOString() };
    } else {
      profiles.push({ ...profile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    setStored('profiles', profiles);
    this.notify();
  }

  public static toggleUserSuspension(userId: string): boolean {
    const profiles = this.getProfiles();
    const user = profiles.find((p) => p.id === userId);
    if (!user) return false;
    user.is_suspended = !user.is_suspended;
    setStored('profiles', profiles);
    this.notify();
    return user.is_suspended;
  }

  // --- DEPARTMENTS & SUBJECTS ---
  public static getDepartments(): Department[] {
    return getStored('departments', INITIAL_DEPARTMENTS);
  }

  public static addDepartment(dept: Omit<Department, 'id'>): Department {
    const departments = this.getDepartments();
    const newDept: Department = {
      id: 'd_' + Date.now(),
      ...dept
    };
    departments.push(newDept);
    setStored('departments', departments);
    this.notify();
    return newDept;
  }

  public static getSubjects(): Subject[] {
    return getStored('subjects', INITIAL_SUBJECTS);
  }

  public static addSubject(subject: Omit<Subject, 'id'>): Subject {
    const subjects = this.getSubjects();
    const newSubj: Subject = {
      id: 'subj_' + Date.now(),
      ...subject
    };
    subjects.push(newSubj);
    setStored('subjects', subjects);
    this.notify();
    return newSubj;
  }

  // --- QUESTIONS & ANSWERS ---
  public static getQuestions(): Question[] {
    return getStored('questions', INITIAL_QUESTIONS);
  }

  public static getQuestionById(id: string): Question | undefined {
    return this.getQuestions().find((q) => q.id === id);
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
    const questions = this.getQuestions();
    const newQ: Question = {
      id: 'q_' + Date.now(),
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
    questions.unshift(newQ);
    setStored('questions', questions);
    this.notify();
    return newQ;
  }

  public static voteQuestion(questionId: string, direction: 'up' | 'down'): Question | undefined {
    const questions = this.getQuestions();
    const q = questions.find((item) => item.id === questionId);
    if (!q) return undefined;

    if (q.user_voted === direction) {
      // cancel vote
      q.upvotes += direction === 'up' ? -1 : 1;
      q.user_voted = null;
    } else {
      const delta = q.user_voted ? (direction === 'up' ? 2 : -2) : (direction === 'up' ? 1 : -1);
      q.upvotes += delta;
      q.user_voted = direction;
    }

    setStored('questions', questions);
    this.notify();
    return q;
  }

  public static deleteQuestion(id: string): void {
    let questions = this.getQuestions();
    questions = questions.filter((q) => q.id !== id);
    setStored('questions', questions);
    this.notify();
  }

  public static getAnswers(questionId: string): Answer[] {
    const allAnswers = getStored('answers', INITIAL_ANSWERS);
    return allAnswers.filter((a) => a.question_id === questionId);
  }

  public static addAnswer(data: {
    question_id: string;
    author: Profile;
    content: string;
    image_url?: string;
  }): Answer {
    const allAnswers = getStored('answers', INITIAL_ANSWERS);
    const newAnswer: Answer = {
      id: 'ans_' + Date.now(),
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
    allAnswers.push(newAnswer);
    setStored('answers', allAnswers);

    // Update question answers count
    const questions = this.getQuestions();
    const q = questions.find((item) => item.id === data.question_id);
    if (q) {
      q.answers_count = (q.answers_count || 0) + 1;
      setStored('questions', questions);

      // Create notification for question author
      if (q.author_id !== data.author.id) {
        this.addNotification({
          user_id: q.author_id,
          type: 'answer',
          title: 'New answer on your question',
          message: `${data.author.full_name} answered: "${q.title.slice(0, 40)}..."`,
          link: `/questions/${q.id}`
        });
      }
    }

    this.notify();
    return newAnswer;
  }

  public static voteAnswer(answerId: string, direction: 'up' | 'down'): Answer | undefined {
    const answers = getStored('answers', INITIAL_ANSWERS);
    const ans = answers.find((a) => a.id === answerId);
    if (!ans) return undefined;

    if (ans.user_voted === direction) {
      ans.upvotes += direction === 'up' ? -1 : 1;
      ans.user_voted = null;
    } else {
      const delta = ans.user_voted ? (direction === 'up' ? 2 : -2) : (direction === 'up' ? 1 : -1);
      ans.upvotes += delta;
      ans.user_voted = direction;
    }
    setStored('answers', answers);
    this.notify();
    return ans;
  }

  public static acceptAnswer(questionId: string, answerId: string): void {
    const questions = this.getQuestions();
    const q = questions.find((item) => item.id === questionId);
    if (!q) return;

    const answers = getStored('answers', INITIAL_ANSWERS);
    answers.forEach((a) => {
      if (a.question_id === questionId) {
        a.is_accepted = a.id === answerId;
      }
    });

    q.accepted_answer_id = answerId;
    q.is_resolved = true;

    setStored('questions', questions);
    setStored('answers', answers);

    const acceptedAnswer = answers.find((a) => a.id === answerId);
    if (acceptedAnswer && acceptedAnswer.author_id !== q.author_id) {
      this.addNotification({
        user_id: acceptedAnswer.author_id,
        type: 'accepted_answer',
        title: 'Your answer was marked Accepted! ⭐',
        message: `Your answer on "${q.title.slice(0, 40)}..." was accepted.`,
        link: `/questions/${q.id}`
      });
    }

    this.notify();
  }

  public static addComment(data: {
    parent_type: 'question' | 'answer' | 'post';
    parent_id: string;
    author: Profile;
    content: string;
  }): Comment {
    const newComment: Comment = {
      id: 'comm_' + Date.now(),
      parent_type: data.parent_type,
      parent_id: data.parent_id,
      author_id: data.author.id,
      author_name: data.author.full_name,
      author_avatar: data.author.avatar_url,
      content: data.content,
      created_at: new Date().toISOString()
    };

    if (data.parent_type === 'answer') {
      const answers = getStored('answers', INITIAL_ANSWERS);
      const ans = answers.find((a) => a.id === data.parent_id);
      if (ans) {
        ans.comments = ans.comments || [];
        ans.comments.push(newComment);
        setStored('answers', answers);
      }
    } else if (data.parent_type === 'post') {
      const posts = this.getPosts();
      const p = posts.find((item) => item.id === data.parent_id);
      if (p) {
        p.comments = p.comments || [];
        p.comments.push(newComment);
        p.comments_count = p.comments.length;
        setStored('posts', posts);
      }
    }

    this.notify();
    return newComment;
  }

  // --- COMMUNITY POSTS ---
  public static getPosts(): Post[] {
    return getStored('posts', INITIAL_POSTS);
  }

  public static createPost(data: {
    author: Profile;
    category: Post['category'];
    title: string;
    content: string;
    tags: string[];
    image_url?: string;
  }): Post {
    const posts = this.getPosts();
    const newPost: Post = {
      id: 'post_' + Date.now(),
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
      created_at: new Date().toISOString()
    };
    posts.unshift(newPost);
    setStored('posts', posts);
    this.notify();
    return newPost;
  }

  public static toggleLikePost(postId: string): Post | undefined {
    const posts = this.getPosts();
    const p = posts.find((item) => item.id === postId);
    if (!p) return undefined;
    p.user_liked = !p.user_liked;
    p.likes += p.user_liked ? 1 : -1;
    setStored('posts', posts);
    this.notify();
    return p;
  }

  // --- LOST & FOUND ---
  public static getLostFoundItems(): LostFoundItem[] {
    return getStored('lost_found', INITIAL_LOST_FOUND);
  }

  public static getLostFoundById(id: string): LostFoundItem | undefined {
    return this.getLostFoundItems().find((item) => item.id === id);
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
    const items = this.getLostFoundItems();
    const newItem: LostFoundItem = {
      id: 'lf_' + Date.now(),
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
    items.unshift(newItem);
    setStored('lost_found', items);
    this.notify();
    return newItem;
  }

  public static markLostFoundResolved(itemId: string): LostFoundItem | undefined {
    const items = this.getLostFoundItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) return undefined;
    item.status = 'resolved';
    item.resolved_date = new Date().toISOString();
    setStored('lost_found', items);
    this.notify();
    return item;
  }

  // --- PAST PAPERS ---
  public static getPastPapers(): PastPaper[] {
    return getStored('past_papers', INITIAL_PAST_PAPERS);
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
    const papers = this.getPastPapers();
    const newPaper: PastPaper = {
      id: 'pp_' + Date.now(),
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
      file_url: '/sample-papers/CS201_Midterm_2025.pdf', // points to real sample pdf
      file_name: data.file_name,
      file_size_kb: data.file_size_kb,
      downloads: 0,
      status: data.uploader.role === 'admin' ? 'approved' : 'pending',
      created_at: new Date().toISOString()
    };
    papers.unshift(newPaper);
    setStored('past_papers', papers);
    this.notify();
    return newPaper;
  }

  public static setPastPaperStatus(paperId: string, status: 'approved' | 'rejected'): void {
    const papers = this.getPastPapers();
    const p = papers.find((item) => item.id === paperId);
    if (!p) return;
    p.status = status;
    setStored('past_papers', papers);
    this.notify();
  }

  public static incrementDownload(paperId: string): void {
    const papers = this.getPastPapers();
    const p = papers.find((item) => item.id === paperId);
    if (p) {
      p.downloads = (p.downloads || 0) + 1;
      setStored('past_papers', papers);
      this.notify();
    }
  }

  // --- SCHOLARSHIPS & OPPORTUNITIES ---
  public static getScholarships(): Scholarship[] {
    return getStored('scholarships', INITIAL_SCHOLARSHIPS);
  }

  public static createScholarship(data: Omit<Scholarship, 'id' | 'created_at' | 'is_verified'> & { author?: Profile }): Scholarship {
    const scholarships = this.getScholarships();
    const newSch: Scholarship = {
      id: 'sch_' + Date.now(),
      ...data,
      is_verified: data.author?.role === 'admin',
      created_at: new Date().toISOString()
    };
    scholarships.unshift(newSch);
    setStored('scholarships', scholarships);
    this.notify();
    return newSch;
  }

  public static verifyScholarship(id: string): void {
    const scholarships = this.getScholarships();
    const sch = scholarships.find((s) => s.id === id);
    if (sch) {
      sch.is_verified = true;
      setStored('scholarships', scholarships);
      this.notify();
    }
  }

  // --- BOOKMARKS ---
  public static getBookmarks(userId: string): Bookmark[] {
    const all = getStored('bookmarks', INITIAL_BOOKMARKS);
    return all.filter((b) => b.user_id === userId);
  }

  public static isBookmarked(userId: string, itemType: Bookmark['item_type'], itemId: string): boolean {
    const bookmarks = this.getBookmarks(userId);
    return bookmarks.some((b) => b.item_type === itemType && b.item_id === itemId);
  }

  public static toggleBookmark(data: {
    user_id: string;
    item_type: Bookmark['item_type'];
    item_id: string;
    title: string;
    category?: string;
    link: string;
  }): boolean {
    const all = getStored('bookmarks', INITIAL_BOOKMARKS);
    const existingIdx = all.findIndex(
      (b) => b.user_id === data.user_id && b.item_type === data.item_type && b.item_id === data.item_id
    );

    if (existingIdx >= 0) {
      all.splice(existingIdx, 1);
      setStored('bookmarks', all);
      this.notify();
      return false;
    } else {
      const newBm: Bookmark = {
        id: 'bm_' + Date.now(),
        user_id: data.user_id,
        item_type: data.item_type,
        item_id: data.item_id,
        title: data.title,
        category: data.category,
        link: data.link,
        created_at: new Date().toISOString()
      };
      all.unshift(newBm);
      setStored('bookmarks', all);
      this.notify();
      return true;
    }
  }

  // --- MESSAGES & CONVERSATIONS ---
  public static getConversations(userId: string): Conversation[] {
    const all = getStored('conversations', INITIAL_CONVERSATIONS);
    return all.filter((c) => c.participant_ids.includes(userId));
  }

  public static getMessages(conversationId: string): Message[] {
    const all = getStored('messages', INITIAL_MESSAGES);
    return all.filter((m) => m.conversation_id === conversationId);
  }

  public static sendMessage(data: {
    conversation_id: string;
    sender: Profile;
    content: string;
  }): Message {
    const messages = getStored('messages', INITIAL_MESSAGES);
    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      conversation_id: data.conversation_id,
      sender_id: data.sender.id,
      sender_name: data.sender.full_name,
      sender_avatar: data.sender.avatar_url,
      content: data.content,
      created_at: new Date().toISOString(),
      is_read: false
    };
    messages.push(newMsg);
    setStored('messages', messages);

    // Update conversation last_message
    const convs = getStored('conversations', INITIAL_CONVERSATIONS);
    const conv = convs.find((c) => c.id === data.conversation_id);
    if (conv) {
      conv.last_message = {
        content: data.content,
        sender_id: data.sender.id,
        created_at: newMsg.created_at
      };
      conv.updated_at = newMsg.created_at;
      setStored('conversations', convs);
    }

    this.notify();
    return newMsg;
  }

  public static startConversation(currentUser: Profile, targetUser: Profile): Conversation {
    const convs = getStored('conversations', INITIAL_CONVERSATIONS);
    let existing = convs.find(
      (c) => c.participant_ids.includes(currentUser.id) && c.participant_ids.includes(targetUser.id)
    );

    if (!existing) {
      existing = {
        id: 'conv_' + Date.now(),
        participant_ids: [currentUser.id, targetUser.id],
        participants: [currentUser, targetUser],
        unread_count: 0,
        updated_at: new Date().toISOString()
      };
      convs.unshift(existing);
      setStored('conversations', convs);
      this.notify();
    }
    return existing;
  }

  // --- NOTIFICATIONS ---
  public static getNotifications(userId: string): Notification[] {
    const all = getStored('notifications', INITIAL_NOTIFICATIONS);
    return all.filter((n) => n.user_id === userId);
  }

  public static addNotification(data: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Notification {
    const all = getStored('notifications', INITIAL_NOTIFICATIONS);
    const newNotif: Notification = {
      id: 'notif_' + Date.now(),
      ...data,
      is_read: false,
      created_at: new Date().toISOString()
    };
    all.unshift(newNotif);
    setStored('notifications', all);
    this.notify();
    return newNotif;
  }

  public static markNotificationRead(id: string): void {
    const all = getStored('notifications', INITIAL_NOTIFICATIONS);
    const notif = all.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      setStored('notifications', all);
      this.notify();
    }
  }

  public static markAllNotificationsRead(userId: string): void {
    const all = getStored('notifications', INITIAL_NOTIFICATIONS);
    all.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    setStored('notifications', all);
    this.notify();
  }

  // --- REPORTS & MODERATION ---
  public static getReports(): Report[] {
    return getStored('reports', INITIAL_REPORTS);
  }

  public static submitReport(data: {
    reporter: Profile;
    item_type: Report['item_type'];
    item_id: string;
    item_title?: string;
    reason: Report['reason'];
    details: string;
  }): Report {
    const reports = this.getReports();
    const newRep: Report = {
      id: 'rep_' + Date.now(),
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
    reports.unshift(newRep);
    setStored('reports', reports);
    this.notify();
    return newRep;
  }

  public static resolveReport(reportId: string, status: 'resolved' | 'dismissed', adminNotes?: string): void {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (!rep) return;
    rep.status = status;
    rep.admin_notes = adminNotes;
    rep.resolved_at = new Date().toISOString();
    setStored('reports', reports);
    this.notify();
  }

  // --- PLATFORM STATS ---
  public static getStats() {
    const profiles = this.getProfiles();
    const questions = this.getQuestions();
    const answers = getStored('answers', INITIAL_ANSWERS);
    const lostFound = this.getLostFoundItems();
    const pastPapers = this.getPastPapers();
    const scholarships = this.getScholarships();
    const reports = this.getReports();

    return {
      totalStudents: profiles.filter((p) => p.role === 'student').length,
      activeQuestions: questions.length,
      totalAnswers: answers.length,
      lostItems: lostFound.filter((i) => i.type === 'lost').length,
      foundItems: lostFound.filter((i) => i.type === 'found').length,
      pastPapersCount: pastPapers.filter((p) => p.status === 'approved').length,
      pendingPapers: pastPapers.filter((p) => p.status === 'pending').length,
      activeScholarships: scholarships.filter((s) => s.status !== 'closed').length,
      pendingReports: reports.filter((r) => r.status === 'pending').length
    };
  }
}
