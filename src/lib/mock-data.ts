import { 
  Profile, 
  Department, 
  Program, 
  Semester, 
  Subject, 
  Question, 
  Answer, 
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

export const INITIAL_SETTINGS: SystemSettings = {
  university_name: 'Khwaja Fareed University of Engineering & Information Technology (KFUEIT)',
  allowed_email_domains: ['kfueit.edu.pk'],
  allow_public_viewing: true,
  max_upload_size_mb: 25,
  maintenance_mode: false,
  announcement_banner: '📢 Welcome to UniMate - Official KFUEIT Student Community Platform'
};

// Pre-configured Campus Administrator: Ahmad Khan & Verified Students
export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'admin-ahmad-khan-2026',
    email: 'ahmad.admin@kfueit.edu.pk',
    full_name: 'Ahmad Khan',
    role: 'admin',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    program: 'BS Computer Science (Super Admin)',
    semester: 8,
    reg_no: 'ADMIN-2022-001',
    is_anonymous: false,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'student-zain-ali-2026',
    email: 'zain.ali@kfueit.edu.pk',
    full_name: 'Zain Ali',
    role: 'student',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    program: 'BS Computer Science',
    semester: 6,
    reg_no: 'BSCS-2022-045',
    is_anonymous: true, // Posts anonymously by default
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'student-fatima-noor-2026',
    email: 'fatima.noor@kfueit.edu.pk',
    full_name: 'Fatima Noor',
    role: 'student',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    program: 'BS Software Engineering',
    semester: 4,
    reg_no: 'BSSE-2023-018',
    is_anonymous: false,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: new Date('2026-02-15').toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'student-hamza-tariq-2026',
    email: 'hamza.tariq@kfueit.edu.pk',
    full_name: 'Hamza Tariq',
    role: 'moderator',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    department_name: 'Department of Electrical Engineering',
    program: 'BS Electrical Engineering',
    semester: 7,
    reg_no: 'BSEE-2021-089',
    is_anonymous: false,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: new Date('2026-01-20').toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Department of Computer Science & IT',
    code: 'CS-IT',
    description: 'BSCS, BS Software Engineering, AI, Data Science, and IT degree tracks.',
    icon: 'Code2'
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Department of Electrical Engineering',
    code: 'EE',
    description: 'Power systems, telecommunications, robotics, and digital logic circuits.',
    icon: 'Cpu'
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'Department of Mechanical Engineering',
    code: 'ME',
    description: 'Thermodynamics, CAD design, fluid dynamics, and manufacturing.',
    icon: 'Wrench'
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Department of Civil Engineering',
    code: 'CE',
    description: 'Structural engineering, hydraulics, transportation, and surveying.',
    icon: 'Building'
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    name: 'Department of Management Sciences',
    code: 'MS',
    description: 'BBA, Accounting & Finance, Business Analytics, and Supply Chain.',
    icon: 'Building2'
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    name: 'Department of Basic Sciences & Humanities',
    code: 'BSH',
    description: 'Applied Mathematics, Physics, Chemistry, and English Communication.',
    icon: 'FlaskConical'
  },
  {
    id: 'd7777777-7777-7777-7777-777777777777',
    name: 'Department of Chemical & Materials Engineering',
    code: 'CME',
    description: 'Process systems, petroleum refinement, and materials engineering.',
    icon: 'Flame'
  }
];

export const INITIAL_PROGRAMS: Program[] = [
  { id: 'prog_1', department_id: 'd1111111-1111-1111-1111-111111111111', name: 'BS Computer Science', degree_level: 'BS' },
  { id: 'prog_2', department_id: 'd1111111-1111-1111-1111-111111111111', name: 'BS Software Engineering', degree_level: 'BS' },
  { id: 'prog_3', department_id: 'd1111111-1111-1111-1111-111111111111', name: 'BS Artificial Intelligence', degree_level: 'BS' },
  { id: 'prog_4', department_id: 'd1111111-1111-1111-1111-111111111111', name: 'BS Data Science', degree_level: 'BS' },
  { id: 'prog_5', department_id: 'd2222222-2222-2222-2222-222222222222', name: 'BS Electrical Engineering', degree_level: 'BS' },
  { id: 'prog_6', department_id: 'd3333333-3333-3333-3333-333333333333', name: 'BS Mechanical Engineering', degree_level: 'BS' },
  { id: 'prog_7', department_id: 'd4444444-4444-4444-4444-444444444444', name: 'BS Civil Engineering', degree_level: 'BS' },
  { id: 'prog_8', department_id: 'd5555555-5555-5555-5555-555555555555', name: 'Bachelor of Business Administration (BBA)', degree_level: 'BS' }
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: '00000000-0000-0000-0000-000000000001', number: 1, name: 'Semester 1' },
  { id: '00000000-0000-0000-0000-000000000002', number: 2, name: 'Semester 2' },
  { id: '00000000-0000-0000-0000-000000000003', number: 3, name: 'Semester 3' },
  { id: '00000000-0000-0000-0000-000000000004', number: 4, name: 'Semester 4' },
  { id: '00000000-0000-0000-0000-000000000005', number: 5, name: 'Semester 5' },
  { id: '00000000-0000-0000-0000-000000000006', number: 6, name: 'Semester 6' },
  { id: '00000000-0000-0000-0000-000000000007', number: 7, name: 'Semester 7' },
  { id: '00000000-0000-0000-0000-000000000008', number: 8, name: 'Semester 8' }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 's_cs101',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    semester_id: '00000000-0000-0000-0000-000000000001',
    semester_number: 1,
    name: 'Programming Fundamentals',
    code: 'CS-101',
    description: 'Foundations of procedural problem solving using C/C++.',
    credits: 4
  },
  {
    id: 's_cs102',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    semester_id: '00000000-0000-0000-0000-000000000002',
    semester_number: 2,
    name: 'Object Oriented Programming',
    code: 'CS-102',
    description: 'Classes, encapsulation, inheritance, polymorphism, and memory management.',
    credits: 4
  },
  {
    id: 's_cs201',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    semester_id: '00000000-0000-0000-0000-000000000003',
    semester_number: 3,
    name: 'Data Structures & Algorithms',
    code: 'CS-201',
    description: 'Stacks, queues, BSTs, heaps, graph traversal, and time complexity.',
    credits: 4
  },
  {
    id: 's_cs202',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    semester_id: '00000000-0000-0000-0000-000000000004',
    semester_number: 4,
    name: 'Database Systems',
    code: 'CS-202',
    description: 'Relational database design, normalization, indexing, and SQL.',
    credits: 4
  },
  {
    id: 's_ee101',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    department_name: 'Department of Electrical Engineering',
    semester_id: '00000000-0000-0000-0000-000000000001',
    semester_number: 1,
    name: 'Linear Circuit Analysis',
    code: 'EE-101',
    description: 'Circuit theorems, AC/DC analysis, nodal/mesh solutions.',
    credits: 4
  },
  {
    id: 's_math101',
    department_id: 'd6666666-6666-6666-6666-666666666666',
    department_name: 'Department of Basic Sciences & Humanities',
    semester_id: '00000000-0000-0000-0000-000000000001',
    semester_number: 1,
    name: 'Calculus & Analytical Geometry',
    code: 'MATH-101',
    description: 'Limits, derivatives, integration techniques, and multivariate calculus.',
    credits: 3
  }
];

// Collections for user generated content with pending moderation items
export const INITIAL_QUESTIONS: Question[] = [];
export const INITIAL_ANSWERS: Answer[] = [];

// Seeded pending post awaiting admin moderation
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-pending-demo-1',
    author_id: 'student-usman-84',
    author_name: 'Usman Ali (Roll # CS-2022-84)',
    author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    author_role: 'student',
    category: 'resource',
    title: 'Hand-Written Complete Notes & Solved Papers for Data Structures (CS-201)',
    content: 'Assalam-o-Alaikum peers, I have compiled high-quality lecture notes, diagrams, and solved midterm questions for Data Structures & Algorithms (CS-201). Requesting the campus administrator to review and approve so all students can benefit!',
    tags: ['CS201', 'DataStructures', 'MidtermPrep', 'Notes'],
    likes: 0,
    comments_count: 0,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_LOST_FOUND: LostFoundItem[] = [];

// Seeded pending past paper awaiting verification
export const INITIAL_PAST_PAPERS: PastPaper[] = [
  {
    id: 'paper-pending-demo-1',
    uploader_id: 'student-hamza-19',
    uploader_name: 'Hamza Tariq (Roll # CS-2023-19)',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Department of Computer Science & IT',
    subject_id: 's_cs201',
    subject_name: 'Data Structures & Algorithms',
    subject_code: 'CS-201',
    semester_number: 3,
    year: 2025,
    exam_type: 'midterm',
    title: 'CS-201 Midterm Exam Spring 2025 (Official Exam Paper)',
    file_url: '/sample-papers/CS201_Midterm_2025.pdf',
    file_name: 'CS201_Midterm_Spring2025_Exam.pdf',
    file_size_kb: 2450,
    downloads: 0,
    status: 'pending',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export const INITIAL_SCHOLARSHIPS: Scholarship[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Message[] = [];

// High-priority unread admin notifications for Ahmad Khan
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-admin-post-1',
    user_id: 'admin-ahmad-khan-2026',
    type: 'report_status',
    title: '🔔 Student Post Awaiting Admin Approval',
    message: 'Usman Ali submitted "Hand-Written Complete Notes & Solved Papers for Data Structures". Please review and approve or reject.',
    link: '/admin',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-admin-paper-1',
    user_id: 'admin-ahmad-khan-2026',
    type: 'report_status',
    title: '📄 Exam Paper Verification Required',
    message: 'Hamza Tariq submitted "CS-201 Midterm Exam Spring 2025" for official campus library inclusion.',
    link: '/admin',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export const INITIAL_REPORTS: Report[] = [];
export const INITIAL_BOOKMARKS: Bookmark[] = [];

