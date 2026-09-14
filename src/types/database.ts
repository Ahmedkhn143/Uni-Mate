export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string;
  department_name?: string;
  program?: string;
  semester?: number;
  avatar_url?: string;
  bio?: string;
  student_id?: string;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  icon?: string;
}

export interface Program {
  id: string;
  department_id: string;
  name: string;
  degree_level: 'BS' | 'MS' | 'PhD';
}

export interface Semester {
  id: string;
  number: number;
  name: string;
}

export interface Subject {
  id: string;
  department_id: string;
  department_name?: string;
  semester_id?: string;
  semester_number?: number;
  name: string;
  code: string;
  description: string;
  credits: number;
}

export interface Question {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_department?: string;
  department_id: string;
  department_name: string;
  subject_id?: string;
  subject_name?: string;
  title: string;
  description: string;
  tags: string[];
  image_url?: string;
  upvotes: number;
  user_voted?: 'up' | 'down' | null;
  views: number;
  answers_count: number;
  accepted_answer_id?: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_department?: string;
  content: string;
  image_url?: string;
  upvotes: number;
  user_voted?: 'up' | 'down' | null;
  is_accepted: boolean;
  comments?: Comment[];
  created_at: string;
}

export interface Comment {
  id: string;
  parent_type: 'question' | 'answer' | 'post';
  parent_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export type PostCategory = 'discussion' | 'announcement' | 'study_help' | 'resource';

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: UserRole;
  category: PostCategory;
  title: string;
  content: string;
  image_url?: string;
  tags: string[];
  likes: number;
  user_liked?: boolean;
  comments_count: number;
  comments?: Comment[];
  is_pinned?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type LostFoundType = 'lost' | 'found';
export type ItemCategory = 
  | 'ID/Card' 
  | 'Wallet' 
  | 'Keys' 
  | 'Books' 
  | 'Electronics' 
  | 'Documents' 
  | 'Clothing' 
  | 'Accessories' 
  | 'Other';

export interface LostFoundItem {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_email?: string;
  type: LostFoundType;
  category: ItemCategory;
  title: string;
  description: string;
  location: string;
  event_date: string;
  image_url?: string;
  contact_info: string;
  contact_preference: 'email' | 'phone' | 'in_app';
  status: 'open' | 'resolved';
  resolved_date?: string;
  created_at: string;
}

export type ExamType = 'midterm' | 'final' | 'quiz' | 'assignment';

export interface PastPaper {
  id: string;
  uploader_id: string;
  uploader_name: string;
  department_id: string;
  department_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  semester_number: number;
  year: number;
  exam_type: ExamType;
  title: string;
  file_url: string;
  file_name: string;
  file_size_kb: number;
  downloads: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type OpportunityCategory = 
  | 'Scholarship' 
  | 'Internship' 
  | 'Workshop' 
  | 'Competition' 
  | 'Fellowship' 
  | 'Job' 
  | 'Other';

export interface Scholarship {
  id: string;
  author_id?: string;
  title: string;
  organization: string;
  description: string;
  category: OpportunityCategory;
  eligibility: string;
  deadline: string;
  application_url: string;
  image_url?: string;
  department_eligibility?: string[];
  status: 'open' | 'closing_soon' | 'closed';
  amount?: string;
  location?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  item_type: 'question' | 'paper' | 'scholarship' | 'post' | 'lost_found';
  item_id: string;
  created_at: string;
  // Hydrated preview metadata
  title?: string;
  snippet?: string;
  category?: string;
  link?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participants: Profile[];
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count: number;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'answer' | 'comment' | 'accepted_answer' | 'message' | 'report_status' | 'announcement';
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export type ReportReason = 
  | 'spam' 
  | 'harassment' 
  | 'fake_information' 
  | 'inappropriate_content' 
  | 'copyright_issue' 
  | 'scam' 
  | 'other';

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name: string;
  item_type: 'question' | 'answer' | 'post' | 'lost_found' | 'paper' | 'user';
  item_id: string;
  item_title?: string;
  reason: ReportReason;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface SystemSettings {
  university_name: string;
  allowed_email_domains: string[];
  allow_public_viewing: boolean;
  max_upload_size_mb: number;
  maintenance_mode: boolean;
  announcement_banner?: string;
  updated_at?: string;
}
