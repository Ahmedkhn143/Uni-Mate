-- =====================================================================
-- UniMate: Realistic University Seed Data
-- =====================================================================

-- Insert System Settings
INSERT INTO public.system_settings (id, university_name, allowed_email_domains, allow_public_viewing, max_upload_size_mb, maintenance_mode, announcement_banner)
VALUES (
    1,
    'Metro State University',
    ARRAY['student.edu', 'university.edu', 'metrostate.edu'],
    TRUE,
    25,
    FALSE,
    'Welcome to the Fall Semester! Final exam past papers are now available in the resource library.'
) ON CONFLICT (id) DO UPDATE SET university_name = EXCLUDED.university_name;

-- Insert Departments
INSERT INTO public.departments (id, name, code, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'Computer Science & IT', 'CS', 'Algorithms, software engineering, artificial intelligence, and computing systems.'),
('d2222222-2222-2222-2222-222222222222', 'Electrical Engineering', 'EE', 'Power systems, electronics, telecommunications, and robotics.'),
('d3333333-3333-3333-3333-333333333333', 'Business Administration', 'BBA', 'Finance, management, marketing, entrepreneurship, and supply chain.'),
('d4444444-4444-4444-4444-444444444444', 'Media & Design', 'MD', 'Digital communications, graphic design, journalism, and interactive media.')
ON CONFLICT (code) DO NOTHING;

-- Insert Programs
INSERT INTO public.programs (id, department_id, name, degree_level) VALUES
('p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'BS Computer Science', 'BS'),
('p2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'BS Software Engineering', 'BS'),
('p3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'BS Electrical Engineering', 'BS'),
('p4444444-4444-4444-4444-444444444444', 'd3333333-3333-3333-3333-333333333333', 'Bachelor of Business Administration', 'BS')
ON CONFLICT DO NOTHING;

-- Insert Semesters 1 - 8
INSERT INTO public.semesters (id, number, name) VALUES
('s1111111-1111-1111-1111-111111111111', 1, 'Semester 1 (Freshman Fall)'),
('s2222222-2222-2222-2222-222222222222', 2, 'Semester 2 (Freshman Spring)'),
('s3333333-3333-3333-3333-333333333333', 3, 'Semester 3 (Sophomore Fall)'),
('s4444444-4444-4444-4444-444444444444', 4, 'Semester 4 (Sophomore Spring)'),
('s5555555-5555-5555-5555-555555555555', 5, 'Semester 5 (Junior Fall)'),
('s6666666-6666-6666-6666-666666666666', 6, 'Semester 6 (Junior Spring)'),
('s7777777-7777-7777-7777-777777777777', 7, 'Semester 7 (Senior Fall)'),
('s8888888-8888-8888-8888-888888888888', 8, 'Semester 8 (Senior Spring)')
ON CONFLICT (number) DO NOTHING;

-- Insert Subjects
INSERT INTO public.subjects (id, department_id, semester_id, name, code, description, credits) VALUES
('c1010000-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 's3333333-3333-3333-3333-333333333333', 'Data Structures & Algorithms', 'CS-201', 'Stacks, queues, linked lists, balanced trees, graph representations, searching and sorting algorithms.', 4),
('c1020000-0000-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 's4444444-4444-4444-4444-444444444444', 'Database Management Systems', 'CS-302', 'Relational database model, normalization, SQL, indexing, transaction processing and concurrency control.', 3),
('c1030000-0000-0000-0000-000000000003', 'd1111111-1111-1111-1111-111111111111', 's5555555-5555-5555-5555-555555555555', 'Operating Systems', 'CS-305', 'Process management, virtual memory, concurrency, multi-threading, file systems, and scheduling.', 4),
('c1040000-0000-0000-0000-000000000004', 'd1111111-1111-1111-1111-111111111111', 's5555555-5555-5555-5555-555555555555', 'Computer Networks', 'CS-310', 'OSI reference model, TCP/IP, routing protocols, socket programming, network security fundamentals.', 3),
('c2010000-0000-0000-0000-000000000005', 'd2222222-2222-2222-2222-222222222222', 's3333333-3333-3333-3333-333333333333', 'Digital Logic Design', 'EE-203', 'Boolean algebra, combinational logic, sequential state machines, registers, and FPGA design.', 4),
('c3010000-0000-0000-0000-000000000006', 'd3333333-3333-3333-3333-333333333333', 's2222222-2222-2222-2222-222222222222', 'Principles of Marketing', 'MKT-101', 'Market analysis, consumer behavior, branding strategies, promotional campaigns, and pricing models.', 3)
ON CONFLICT (code) DO NOTHING;

-- Insert Demo Profiles (Admin and Students)
INSERT INTO public.profiles (id, email, full_name, role, department_id, program, semester, student_id, bio, is_suspended) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@student.edu', 'Dr. Sarah Hayes', 'admin', 'd1111111-1111-1111-1111-111111111111', 'Faculty & Admin', 8, 'ADM-01', 'Campus Community Moderator and Academic Coordinator at Metro State University.', FALSE),
('u0000000-0000-0000-0000-000000000002', 'alex.rivera@student.edu', 'Alex Rivera', 'student', 'd1111111-1111-1111-1111-111111111111', 'BS Computer Science', 4, 'CS22-094', 'Sophomore passionate about distributed systems, algorithms, and web development.', FALSE),
('u0000000-0000-0000-0000-000000000003', 'maya.patel@student.edu', 'Maya Patel', 'student', 'd2222222-2222-2222-2222-222222222222', 'BS Electrical Engineering', 3, 'EE23-118', 'Electronics enthusiast, robotics club lead, and lab TA.', FALSE),
('u0000000-0000-0000-0000-000000000004', 'jordan.lee@student.edu', 'Jordan Lee', 'student', 'd3333333-3333-3333-3333-333333333333', 'Bachelor of Business Administration', 5, 'BBA21-042', 'Finance major, president of the Student Investment Association.', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Questions
INSERT INTO public.questions (id, author_id, department_id, subject_id, title, description, tags, upvotes, views, is_resolved) VALUES
('q1000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000001', 
'How do you properly calculate the time complexity of Dijkstra with an Indexed Min-Heap?', 
'I am preparing for the upcoming CS-201 midterm exam. In lecture, the professor mentioned Dijkstra takes O((V + E) log V) with a binary min-heap when decrease-key is implemented via index lookup. Could someone break down why decrease-key takes O(log V) and how the total complexity sums up?', 
ARRAY['algorithms', 'graphs', 'dijkstra', 'exam-prep'], 14, 185, TRUE),

('q2000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 'd1111111-1111-1111-1111-111111111111', 'c1020000-0000-0000-0000-000000000002', 
'Difference between 3NF and BCNF with practical database examples?', 
'Working on the DBMS Lab assignment 3. I understand 3NF removes transitive dependencies, but I am confused by cases where a relation is in 3NF but not Boyce-Codd Normal Form (BCNF). What is a realistic student enrollment or course registration example that illustrates this?', 
ARRAY['dbms', 'normalization', 'sql', 'bcnf'], 9, 122, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Answers
INSERT INTO public.answers (id, question_id, author_id, content, upvotes, is_accepted) VALUES
('ans10000-0000-0000-0000-000000000001', 'q1000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003',
'Great question! Here is the clear breakdown:
1. **Extract-Min**: Each vertex is extracted once from the priority queue. Since there are V vertices, and extracting the min from a binary heap takes O(log V), this contributes **O(V log V)**.
2. **Decrease-Key**: For every edge (u, v), we potentially relax it. There are E edges total. In an indexed min-heap, we maintain an inverted map of vertex ID -> heap index. Finding the element is O(1), and bubbling it up after updating distance takes O(log V). Therefore, E relaxations take **O(E log V)**.
3. Combining them gives **O((V + E) log V)**. For dense graphs where E ~ V², Fibonacci heap gives O(E + V log V), but binary heap is far more practical in reality!', 18, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Link accepted answer
UPDATE public.questions SET accepted_answer_id = 'ans10000-0000-0000-0000-000000000001' WHERE id = 'q1000000-0000-0000-0000-000000000001';

-- Insert Lost & Found Items
INSERT INTO public.lost_found_items (id, author_id, type, category, title, description, location, event_date, contact_info, contact_preference, status) VALUES
('lf100000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003', 'found', 'ID/Card', 'Found Blue Student ID Card (CS Department)', 'Found a university student smart card on the 2nd floor study desk near the library elevators. Cardholder name starts with "K. Miller". Handed to the library front desk or ping me here.', 'Central Library, 2nd Floor Study Area', '2026-09-10', 'Contact via UniMate chat or ask library front desk', 'in_app', 'open'),
('lf200000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000002', 'lost', 'Electronics', 'Lost Black Casio fx-991EX Scientific Calculator', 'Left my calculator on desk row 4 in Auditorium B after the EE-203 lecture yesterday around 3 PM. It has a small red sticker on the back.', 'Auditorium B, Row 4', '2026-09-11', 'alex.rivera@student.edu', 'email', 'open')
ON CONFLICT (id) DO NOTHING;

-- Insert Past Papers
INSERT INTO public.past_papers (id, uploader_id, department_id, subject_id, semester_id, year, exam_type, title, file_url, file_name, file_size_kb, downloads, status) VALUES
('pp100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000001', 's3333333-3333-3333-3333-333333333333', 2025, 'midterm', 'CS-201 Data Structures Midterm Examination (Solved & Annotated)', '/sample-papers/CS201_Midterm_2025.pdf', 'CS201_Midterm_2025.pdf', 1420, 342, 'approved'),
('pp200000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 'c1020000-0000-0000-0000-000000000002', 's4444444-4444-4444-4444-444444444444', 2025, 'final', 'CS-302 Database Management Systems Final Exam Paper', '/sample-papers/CS302_Final_2025.pdf', 'CS302_Final_2025.pdf', 980, 218, 'approved'),
('pp300000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000003', 'd2222222-2222-2222-2222-222222222222', 'c2010000-0000-0000-0000-000000000005', 's3333333-3333-3333-3333-333333333333', 2024, 'midterm', 'EE-203 Digital Logic Design Midterm Exam Solutions', '/sample-papers/EE203_Midterm_2024.pdf', 'EE203_Midterm_2024.pdf', 2150, 165, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Insert Scholarships & Opportunities
INSERT INTO public.scholarships (id, author_id, title, organization, description, category, eligibility, deadline, application_url, status, amount, location, is_verified) VALUES
('sch10000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Future Tech Leaders STEM Merit Scholarship 2026', 'Google & Tech Alliance', 'Full tuition coverage and mentorship for undergraduate students demonstrating high academic achievement and active community leadership in STEM.', 'Scholarship', 'Enrolled undergraduate student, minimum 3.4 GPA, Computer Science or Electrical Engineering major.', '2026-10-31', 'https://buildyourfuture.withgoogle.com/scholarships', 'open', '$10,000 / Year', 'Global / Hybrid', TRUE),
('sch20000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Summer 2027 Software Engineering Fellowships', 'Apex Distributed Cloud Labs', '12-week paid engineering internship working on distributed caching and edge networks. Includes housing stipend and return offer pathway.', 'Internship', 'Students graduating between Dec 2026 and June 2028. Proficiency in modern TypeScript, Go, or Python.', '2026-11-15', 'https://apexlabs.example.com/careers/interns', 'open', '$52/hr + Housing', 'San Francisco & Remote', TRUE)
ON CONFLICT (id) DO NOTHING;
