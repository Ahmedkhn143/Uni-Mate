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

// All demo/mock user data has been removed. Active data is loaded dynamically from Supabase.
export const INITIAL_PROFILES: Profile[] = [];

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

// Clean empty collections for user generated content (populated from live Supabase)
export const INITIAL_QUESTIONS: Question[] = [];
export const INITIAL_ANSWERS: Answer[] = [];
export const INITIAL_POSTS: Post[] = [];
export const INITIAL_LOST_FOUND: LostFoundItem[] = [];
export const INITIAL_PAST_PAPERS: PastPaper[] = [];
export const INITIAL_SCHOLARSHIPS: Scholarship[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];
export const INITIAL_REPORTS: Report[] = [];
export const INITIAL_BOOKMARKS: Bookmark[] = [];
