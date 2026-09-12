import { 
  Profile, 
  Department, 
  Program, 
  Semester, 
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

export const INITIAL_SETTINGS: SystemSettings = {
  university_name: 'Khwaja Fareed University of Engineering & Information Technology (KFUEIT)',
  allowed_email_domains: ['kfueit.edu.pk'],
  allow_public_viewing: true,
  max_upload_size_mb: 25,
  maintenance_mode: false,
  announcement_banner: '📢 Midterm exam past papers have been uploaded to the academic repository. Good luck with prep!'
};

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@kfueit.edu.pk',
    full_name: 'Dr. Sarah Hayes',
    role: 'admin',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    program: 'Faculty & Campus Moderator',
    semester: 8,
    student_id: 'ADM-01',
    bio: 'Dean of Student Affairs & Academic Platform Moderator. Here to support student success and maintain a healthy community.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: '2025-08-15T08:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000002',
    email: 'student@kfueit.edu.pk',
    full_name: 'Alex Rivera',
    role: 'student',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    program: 'BS Computer Science',
    semester: 4,
    student_id: 'CS22-094',
    bio: 'CS Sophomore interested in distributed algorithms, full-stack systems, and open-source software.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2026-02-12T14:30:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000003',
    email: 'maya.patel@kfueit.edu.pk',
    full_name: 'Maya Patel',
    role: 'student',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    department_name: 'Electrical Engineering',
    program: 'BS Electrical Engineering',
    semester: 3,
    student_id: 'EE23-118',
    bio: 'Hardware tinkerer, robotics lead, and digital logic TA. Love helping out on circuit questions!',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: '2025-09-02T11:00:00Z',
    updated_at: '2026-02-14T09:15:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000004',
    email: 'jordan.lee@kfueit.edu.pk',
    full_name: 'Jordan Lee',
    role: 'student',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    department_name: 'Business Administration',
    program: 'Bachelor of Business Administration',
    semester: 5,
    student_id: 'BBA21-042',
    bio: 'Finance & marketing enthusiast. Student Investment Club VP. Always looking for internship leads.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_suspended: false,
    created_at: '2025-09-05T12:00:00Z',
    updated_at: '2026-01-20T16:45:00Z',
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Computer Science & IT',
    code: 'CS',
    description: 'Algorithms, artificial intelligence, software engineering, systems, and cybersecurity.',
    icon: '💻'
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Electrical Engineering',
    code: 'EE',
    description: 'Power systems, microelectronics, telecommunications, robotics, and signal processing.',
    icon: '⚡'
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'Business Administration',
    code: 'BBA',
    description: 'Financial management, strategic marketing, entrepreneurship, and supply chain analytics.',
    icon: '📊'
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Media & Interactive Design',
    code: 'MD',
    description: 'Digital communication, UX/UI, animation, digital journalism, and creative production.',
    icon: '🎨'
  }
];

export const INITIAL_PROGRAMS: Program[] = [
  { id: 'p1', department_id: 'd1111111-1111-1111-1111-111111111111', name: 'BS Computer Science', degree_level: 'BS' },
  { id: 'p2', department_id: 'd1111111-1111-1111-1111-111111111111', name: 'BS Software Engineering', degree_level: 'BS' },
  { id: 'p3', department_id: 'd2222222-2222-2222-2222-222222222222', name: 'BS Electrical Engineering', degree_level: 'BS' },
  { id: 'p4', department_id: 'd3333333-3333-3333-3333-333333333333', name: 'Bachelor of Business Administration', degree_level: 'BS' }
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 's1', number: 1, name: 'Semester 1 (Freshman Fall)' },
  { id: 's2', number: 2, name: 'Semester 2 (Freshman Spring)' },
  { id: 's3', number: 3, name: 'Semester 3 (Sophomore Fall)' },
  { id: 's4', number: 4, name: 'Semester 4 (Sophomore Spring)' },
  { id: 's5', number: 5, name: 'Semester 5 (Junior Fall)' },
  { id: 's6', number: 6, name: 'Semester 6 (Junior Spring)' },
  { id: 's7', number: 7, name: 'Semester 7 (Senior Fall)' },
  { id: 's8', number: 8, name: 'Semester 8 (Senior Spring)' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'c1',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    semester_id: 's3',
    semester_number: 3,
    name: 'Data Structures & Algorithms',
    code: 'CS-201',
    description: 'Fundamental data structures (trees, graphs, heaps) and algorithm analysis techniques.',
    credits: 4
  },
  {
    id: 'c2',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    semester_id: 's4',
    semester_number: 4,
    name: 'Database Management Systems',
    code: 'CS-302',
    description: 'Relational algebra, normalization, query optimization, indexing, ACID transactions.',
    credits: 3
  },
  {
    id: 'c3',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    semester_id: 's5',
    semester_number: 5,
    name: 'Computer Networks',
    code: 'CS-310',
    description: 'OSI 7 layers, TCP/UDP protocols, routing algorithms, socket programming.',
    credits: 3
  },
  {
    id: 'c4',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    department_name: 'Electrical Engineering',
    semester_id: 's3',
    semester_number: 3,
    name: 'Digital Logic Design',
    code: 'EE-203',
    description: 'Karnaugh maps, state machine synthesis, combinational & sequential circuitry, Verilog.',
    credits: 4
  },
  {
    id: 'c5',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    department_name: 'Business Administration',
    semester_id: 's2',
    semester_number: 2,
    name: 'Principles of Marketing',
    code: 'MKT-101',
    description: 'Consumer behavior analysis, brand positioning, 4Ps strategy, and digital channels.',
    credits: 3
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    author_id: 'u0000000-0000-0000-0000-000000000002',
    author_name: 'Alex Rivera',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    author_department: 'Computer Science',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    subject_id: 'c1',
    subject_name: 'Data Structures & Algorithms',
    title: 'How do you properly calculate Dijkstra time complexity with an Indexed Min-Heap?',
    description: 'In CS-201 lecture, the professor mentioned Dijkstra takes O((V + E) log V) with a binary min-heap when decrease-key is implemented via index lookup.\n\nCould someone explain why decrease-key takes O(log V) and how the total complexity sums up across all vertices and edges?',
    tags: ['algorithms', 'dijkstra', 'graph-theory', 'midterm-prep'],
    upvotes: 24,
    views: 312,
    answers_count: 2,
    accepted_answer_id: 'a1',
    is_resolved: true,
    created_at: '2026-03-01T14:20:00Z',
    updated_at: '2026-03-01T16:10:00Z'
  },
  {
    id: 'q2',
    author_id: 'u0000000-0000-0000-0000-000000000003',
    author_name: 'Maya Patel',
    author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    author_department: 'Electrical Engineering',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    subject_id: 'c2',
    subject_name: 'Database Management Systems',
    title: 'Difference between 3NF and BCNF with a realistic student course registration example?',
    description: 'I understand that 3NF removes transitive dependencies where non-prime attributes depend on other non-prime attributes.\n\nHowever, can someone give a clear, practical example of a table that satisfies 3NF but violates Boyce-Codd Normal Form (BCNF)?',
    tags: ['dbms', 'normalization', 'bcnf', 'sql'],
    upvotes: 15,
    views: 189,
    answers_count: 1,
    accepted_answer_id: null,
    is_resolved: false,
    created_at: '2026-03-05T09:45:00Z',
    updated_at: '2026-03-05T09:45:00Z'
  },
  {
    id: 'q3',
    author_id: 'u0000000-0000-0000-0000-000000000004',
    author_name: 'Jordan Lee',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    author_department: 'Business Administration',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    department_name: 'Electrical Engineering',
    subject_id: 'c4',
    subject_name: 'Digital Logic Design',
    title: 'Handling race conditions in asynchronous Mealy sequential circuits?',
    description: 'During our lab synthesis using Verilog, we observed occasional glitch outputs when transitioning between state S1 and S3. How can we introduce hazard-free cover terms or synchronize clock edges properly?',
    tags: ['verilog', 'fpga', 'sequential-circuits', 'hardware'],
    upvotes: 8,
    views: 94,
    answers_count: 0,
    accepted_answer_id: null,
    is_resolved: false,
    created_at: '2026-03-08T11:15:00Z',
    updated_at: '2026-03-08T11:15:00Z'
  }
];

export const INITIAL_ANSWERS: Answer[] = [
  {
    id: 'a1',
    question_id: 'q1',
    author_id: 'u0000000-0000-0000-0000-000000000003',
    author_name: 'Maya Patel',
    author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    author_department: 'Electrical Engineering',
    content: `Great question! Here is the clear step-by-step breakdown:

1. **Extract-Min operations**:
   Each vertex is extracted from the min-heap priority queue exactly once. For $V$ vertices, each extraction takes $O(\\log V)$ time. Total = **$O(V \\log V)$**.

2. **Decrease-Key operations**:
   For every edge $(u, v)$, we potentially relax the edge if $dist[u] + weight(u, v) < dist[v]$. There are $E$ edges total.
   In an **Indexed Min-Heap**, we store a lookup array: \`pos[vertex_id] = index_in_heap\`.
   - Locating the element takes $O(1)$.
   - Updating its distance and bubbling it up (percolate up) takes at most $O(\\log V)$ swaps.
   - For all $E$ relaxations, total decrease-key work = **$O(E \\log V)$**.

3. **Combined Total**:
   Summing both parts: $O(V \\log V + E \\log V) = **O((V + E) \\log V)**$.

For connected graphs where $E \\ge V$, this is often simplified to $O(E \\log V)$. If using a Fibonacci Heap, decrease-key is amortized $O(1)$, giving $O(E + V \\log V)$, but binary heaps have much lower constant factors in real production code!`,
    upvotes: 21,
    is_accepted: true,
    created_at: '2026-03-01T15:30:00Z',
    comments: [
      {
        id: 'c_ans_1',
        parent_type: 'answer',
        parent_id: 'a1',
        author_id: 'u0000000-0000-0000-0000-000000000002',
        author_name: 'Alex Rivera',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'The indexed map lookup explanation made it click immediately. Thank you Maya!',
        created_at: '2026-03-01T16:05:00Z'
      }
    ]
  },
  {
    id: 'a2',
    question_id: 'q1',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    author_name: 'Dr. Sarah Hayes',
    author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    author_department: 'Faculty / CS Dept',
    content: 'Excellent explanation from Maya. Remember for the midterm: if a graph is dense where $E \\approx V^2$, an adjacency matrix with a simple array min-finding approach achieves $O(V^2)$, which is faster than $O(V^2 \\log V)$ with a binary heap.',
    upvotes: 11,
    is_accepted: false,
    created_at: '2026-03-01T18:00:00Z'
  },
  {
    id: 'a3',
    question_id: 'q2',
    author_id: 'u0000000-0000-0000-0000-000000000002',
    author_name: 'Alex Rivera',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    author_department: 'Computer Science',
    content: `Here is the classic student advisor / subject example:

Suppose we have a relation:
\`Enrollment(StudentID, Subject, Advisor)\`

With rules:
1. Each student can take multiple subjects.
2. For each subject, a student has one advisor: \`{StudentID, Subject} -> Advisor\`
3. Each advisor advises only ONE specific subject: \`Advisor -> Subject\`

Candidate keys are: \`{StudentID, Subject}\` and \`{StudentID, Advisor}\`.
Prime attributes: \`StudentID, Subject, Advisor\`.

- **Is it in 3NF?** YES, because in \`Advisor -> Subject\`, the determinant (Advisor) is not a superkey, BUT the dependent (Subject) is a **prime attribute**!
- **Is it in BCNF?** NO, because BCNF requires EVERY determinant in non-trivial FDs to be a superkey, and \`Advisor\` by itself is NOT a superkey.

To fix: Decompose into \`AdvisorSubject(Advisor, Subject)\` and \`StudentAdvisor(StudentID, Advisor)\`.`,
    upvotes: 14,
    is_accepted: false,
    created_at: '2026-03-05T12:20:00Z'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    author_name: 'Dr. Sarah Hayes',
    author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    author_role: 'admin',
    category: 'announcement',
    title: 'University Hackathon & Annual Spring Project Exhibition Announced!',
    content: 'Calling all students across CS, Engineering, and Business! The annual university Innovation Hackathon will be held on April 18-20 at the Student Activity Center. Over $15,000 in prizes and industry mentorship. Register your team of 2-4 members by April 5.',
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    tags: ['hackathon', 'campus-events', 'innovation', 'engineering'],
    likes: 48,
    comments_count: 5,
    is_pinned: true,
    created_at: '2026-03-02T10:00:00Z'
  },
  {
    id: 'p2',
    author_id: 'u0000000-0000-0000-0000-000000000002',
    author_name: 'Alex Rivera',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    author_role: 'student',
    category: 'study_help',
    title: 'Forming a CS-302 Database & SQL study group for finals',
    content: 'Hey everyone, a few of us from Section B are organizing weekend review sessions in Library Study Room 4. We will be solving previous years exam papers and practicing tricky transaction isolation and query optimization questions. Drop a comment if interested!',
    tags: ['dbms', 'study-group', 'cs302', 'finals'],
    likes: 19,
    comments_count: 3,
    is_pinned: false,
    created_at: '2026-03-07T14:30:00Z'
  }
];

export const INITIAL_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf1',
    author_id: 'u0000000-0000-0000-0000-000000000003',
    author_name: 'Maya Patel',
    author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    author_email: 'maya.patel@kfueit.edu.pk',
    type: 'found',
    category: 'ID/Card',
    title: 'Found Student RFID Card (CS Department - Batch 23)',
    description: 'Found a university RFID card near the 2nd floor library study carrels around 4:30 PM. The card has a blue lanyard and says Kevin Miller. Left with library front desk attendant or message me here.',
    location: 'Central Library, 2nd Floor Study Desks',
    event_date: '2026-03-08',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    contact_info: 'Message via UniMate chat or contact library front desk (ext 2201)',
    contact_preference: 'in_app',
    status: 'open',
    created_at: '2026-03-08T16:45:00Z'
  },
  {
    id: 'lf2',
    author_id: 'u0000000-0000-0000-0000-000000000002',
    author_name: 'Alex Rivera',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    author_email: 'student@kfueit.edu.pk',
    type: 'lost',
    category: 'Electronics',
    title: 'Lost Casio Scientific Calculator (Black fx-991EX)',
    description: 'Accidentally left my calculator on desk row 3 in Auditorium B after the EE-203 mid-term review on Monday afternoon. Has a small red sticker with "AR" on the protective sliding lid. Would really appreciate its return!',
    location: 'Auditorium B, Row 3',
    event_date: '2026-03-09',
    image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
    contact_info: 'student@kfueit.edu.pk or message me on UniMate',
    contact_preference: 'in_app',
    status: 'open',
    created_at: '2026-03-09T18:10:00Z'
  },
  {
    id: 'lf3',
    author_id: 'u0000000-0000-0000-0000-000000000004',
    author_name: 'Jordan Lee',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    author_email: 'jordan.lee@kfueit.edu.pk',
    type: 'found',
    category: 'Keys',
    title: 'Found Toyota Car Key with Blue University Carabiner',
    description: 'Spotted on the bench right outside the Business Building cafe courtyard. Turned into Campus Security office at Gate 1.',
    location: 'Business Building Cafe Courtyard Bench',
    event_date: '2026-03-06',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    contact_info: 'Campus Security Gate 1 dispatch office',
    contact_preference: 'in_app',
    status: 'resolved',
    resolved_date: '2026-03-07T11:00:00Z',
    created_at: '2026-03-06T15:00:00Z'
  }
];

export const INITIAL_PAST_PAPERS: PastPaper[] = [
  {
    id: 'pp1',
    uploader_id: 'a0000000-0000-0000-0000-000000000001',
    uploader_name: 'Dr. Sarah Hayes (Faculty)',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    subject_id: 'c1',
    subject_name: 'Data Structures & Algorithms',
    subject_code: 'CS-201',
    semester_number: 3,
    year: 2025,
    exam_type: 'midterm',
    title: 'CS-201 Data Structures Midterm Examination (Solved & Annotated)',
    file_url: '/sample-papers/CS201_Midterm_2025.pdf',
    file_name: 'CS201_Midterm_2025.pdf',
    file_size_kb: 1420,
    downloads: 418,
    status: 'approved',
    created_at: '2025-10-15T09:00:00Z'
  },
  {
    id: 'pp2',
    uploader_id: 'a0000000-0000-0000-0000-000000000001',
    uploader_name: 'Dr. Sarah Hayes (Faculty)',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Computer Science & IT',
    subject_id: 'c2',
    subject_name: 'Database Management Systems',
    subject_code: 'CS-302',
    semester_number: 4,
    year: 2025,
    exam_type: 'final',
    title: 'CS-302 Database Management Systems Final Exam Paper',
    file_url: '/sample-papers/CS302_Final_2025.pdf',
    file_name: 'CS302_Final_2025.pdf',
    file_size_kb: 980,
    downloads: 304,
    status: 'approved',
    created_at: '2025-12-20T14:30:00Z'
  },
  {
    id: 'pp3',
    uploader_id: 'u0000000-0000-0000-0000-000000000003',
    uploader_name: 'Maya Patel (Student TA)',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    department_name: 'Electrical Engineering',
    subject_id: 'c4',
    subject_name: 'Digital Logic Design',
    subject_code: 'EE-203',
    semester_number: 3,
    year: 2024,
    exam_type: 'midterm',
    title: 'EE-203 Digital Logic Design Midterm Exam with Solutions',
    file_url: '/sample-papers/EE203_Midterm_2024.pdf',
    file_name: 'EE203_Midterm_2024.pdf',
    file_size_kb: 2150,
    downloads: 189,
    status: 'approved',
    created_at: '2025-10-18T16:00:00Z'
  }
];

export const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'sch1',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Future Tech Leaders STEM Merit Scholarship 2026',
    organization: 'Global Technology Alliance Foundation',
    description: 'Providing comprehensive tuition coverage, conference travel funding, and 1-on-1 executive mentorship to undergraduate students showing high academic excellence and campus leadership.',
    category: 'Scholarship',
    eligibility: 'Enrolled undergraduate student in CS, Software, or Electrical Engineering with minimum 3.4 cumulative GPA.',
    deadline: '2026-10-31',
    application_url: 'https://buildyourfuture.withgoogle.com/scholarships',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    department_eligibility: ['Computer Science & IT', 'Electrical Engineering'],
    status: 'open',
    amount: '$10,000 / Year',
    location: 'North America / Hybrid',
    is_verified: true,
    created_at: '2026-02-15T10:00:00Z'
  },
  {
    id: 'sch2',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Summer 2027 Distributed Systems Engineering Fellowship',
    organization: 'Apex Cloud & Infrastructure Labs',
    description: '12-week intensive paid engineering fellowship. Fellows will build high-throughput telemetry pipelines and learn directly from staff infrastructure engineers. Includes corporate housing & full stipend.',
    category: 'Internship',
    eligibility: 'Sophomores and Juniors graduating between Dec 2026 and June 2028 with background in C++, Rust, Go, or TypeScript.',
    deadline: '2026-09-30',
    application_url: 'https://careers.example.com/fellows',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
    department_eligibility: ['Computer Science & IT'],
    status: 'closing_soon',
    amount: '$54/hr + Housing',
    location: 'San Francisco, CA & Remote',
    is_verified: true,
    created_at: '2026-02-20T12:00:00Z'
  },
  {
    id: 'sch3',
    author_id: 'u0000000-0000-0000-0000-000000000004',
    title: 'National Venture Capital & Entrepreneurship Student Challenge',
    organization: 'Collegiate Founders Fund',
    description: 'Compete for up to $25,000 in non-dilutive seed grants. Submit your 10-slide deck and 3-minute video pitch solving a verified student or sustainability problem.',
    category: 'Competition',
    eligibility: 'Open to multidisciplinary teams from all departments. At least 50% team members must be active university students.',
    deadline: '2026-11-20',
    application_url: 'https://collegiatefounders.example.org',
    image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
    department_eligibility: ['Business Administration', 'Computer Science & IT', 'Media & Design'],
    status: 'open',
    amount: '$25,000 Grant Prize',
    location: 'Virtual',
    is_verified: true,
    created_at: '2026-03-01T15:00:00Z'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participant_ids: ['u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003'],
    participants: [INITIAL_PROFILES[1], INITIAL_PROFILES[2]],
    last_message: {
      content: 'Hey Maya, thanks again for the Dijkstra explanation! Are you free for the study group this Friday?',
      sender_id: 'u0000000-0000-0000-0000-000000000002',
      created_at: '2026-03-09T17:15:00Z'
    },
    unread_count: 1,
    updated_at: '2026-03-09T17:15:00Z'
  },
  {
    id: 'conv2',
    participant_ids: ['u0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'],
    participants: [INITIAL_PROFILES[1], INITIAL_PROFILES[0]],
    last_message: {
      content: 'Hello Alex, your uploaded CS-201 notes have been verified and added to the official subject resource directory.',
      sender_id: 'a0000000-0000-0000-0000-000000000001',
      created_at: '2026-03-08T10:30:00Z'
    },
    unread_count: 0,
    updated_at: '2026-03-08T10:30:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    conversation_id: 'conv1',
    sender_id: 'u0000000-0000-0000-0000-000000000003',
    sender_name: 'Maya Patel',
    sender_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    content: 'Hi Alex! Saw your post about the CS-201 heap implementation.',
    created_at: '2026-03-09T16:50:00Z',
    is_read: true
  },
  {
    id: 'm2',
    conversation_id: 'conv1',
    sender_id: 'u0000000-0000-0000-0000-000000000002',
    sender_name: 'Alex Rivera',
    sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Hey Maya, thanks again for the Dijkstra explanation! Are you free for the study group this Friday?',
    created_at: '2026-03-09T17:15:00Z',
    is_read: false
  },
  {
    id: 'm3',
    conversation_id: 'conv2',
    sender_id: 'a0000000-0000-0000-0000-000000000001',
    sender_name: 'Dr. Sarah Hayes',
    sender_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    content: 'Hello Alex, your uploaded CS-201 notes have been verified and added to the official subject resource directory.',
    created_at: '2026-03-08T10:30:00Z',
    is_read: true
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    type: 'accepted_answer',
    title: 'Answer Marked Accepted! ⭐',
    message: 'Your answer on "Difference between 3NF and BCNF" was marked as accepted.',
    link: '/questions/q2',
    is_read: false,
    created_at: '2026-03-09T12:00:00Z'
  },
  {
    id: 'n2',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    type: 'answer',
    title: 'New Answer on your Question',
    message: 'Maya Patel answered your question about Dijkstra time complexity.',
    link: '/questions/q1',
    is_read: true,
    created_at: '2026-03-01T15:30:00Z'
  },
  {
    id: 'n3',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    type: 'announcement',
    title: 'Annual Innovation Hackathon Registration',
    message: 'Registrations are now open for the Spring Inter-University Hackathon.',
    link: '/community',
    is_read: true,
    created_at: '2026-03-02T10:00:00Z'
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep1',
    reporter_id: 'u0000000-0000-0000-0000-000000000003',
    reporter_name: 'Maya Patel',
    item_type: 'post',
    item_id: 'sample_spam_post',
    item_title: 'Discount textbook scam link posted in comment',
    reason: 'spam',
    details: 'User posted an external suspicious Telegram bot link claiming to sell pirated exams.',
    status: 'pending',
    created_at: '2026-03-09T14:00:00Z'
  }
];

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm1',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    item_type: 'question',
    item_id: 'q1',
    title: 'How do you properly calculate Dijkstra time complexity with an Indexed Min-Heap?',
    category: 'Data Structures & Algorithms',
    link: '/questions/q1',
    created_at: '2026-03-02T08:00:00Z'
  },
  {
    id: 'bm2',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    item_type: 'paper',
    item_id: 'pp1',
    title: 'CS-201 Data Structures Midterm Examination (Solved & Annotated)',
    category: 'Computer Science & IT',
    link: '/past-papers',
    created_at: '2026-03-03T11:00:00Z'
  },
  {
    id: 'bm3',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    item_type: 'scholarship',
    item_id: 'sch1',
    title: 'Future Tech Leaders STEM Merit Scholarship 2026',
    category: 'Scholarship',
    link: '/scholarships',
    created_at: '2026-03-04T09:30:00Z'
  }
];
