-- =====================================================================
-- UniMate: Initial Seed Data for KFUEIT Campus Platform
-- Run this in your Supabase SQL Editor to populate departments,
-- semesters, core subjects, and default system settings.
-- =====================================================================

-- 1. SYSTEM SETTINGS
INSERT INTO public.system_settings (
    id, 
    university_name, 
    allowed_email_domains, 
    allow_public_viewing, 
    max_upload_size_mb, 
    maintenance_mode, 
    announcement_banner
) VALUES (
    1,
    'Khwaja Fareed University of Engineering & Information Technology (KFUEIT)',
    ARRAY['kfueit.edu.pk'],
    TRUE,
    25,
    FALSE,
    '📢 Welcome to UniMate - Official KFUEIT Student Community & Academic Repository!'
) ON CONFLICT (id) DO UPDATE SET
    university_name = EXCLUDED.university_name,
    allowed_email_domains = EXCLUDED.allowed_email_domains;

-- 2. SEMESTERS (1 to 8)
INSERT INTO public.semesters (id, number, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 1, 'Semester 1 (Freshman Fall)'),
    ('00000000-0000-0000-0000-000000000002', 2, 'Semester 2 (Freshman Spring)'),
    ('00000000-0000-0000-0000-000000000003', 3, 'Semester 3 (Sophomore Fall)'),
    ('00000000-0000-0000-0000-000000000004', 4, 'Semester 4 (Sophomore Spring)'),
    ('00000000-0000-0000-0000-000000000005', 5, 'Semester 5 (Junior Fall)'),
    ('00000000-0000-0000-0000-000000000006', 6, 'Semester 6 (Junior Spring)'),
    ('00000000-0000-0000-0000-000000000007', 7, 'Semester 7 (Senior Fall)'),
    ('00000000-0000-0000-0000-000000000008', 8, 'Semester 8 (Senior Spring)')
ON CONFLICT (number) DO NOTHING;

-- 3. DEPARTMENTS
INSERT INTO public.departments (id, name, code, description) VALUES
    (
        'd1111111-1111-1111-1111-111111111111', 
        'Department of Computer Science & Information Technology', 
        'CS-IT', 
        'BSCS, BS Software Engineering, Artificial Intelligence, Data Science, and IT programs.'
    ),
    (
        'd2222222-2222-2222-2222-222222222222', 
        'Department of Electrical Engineering', 
        'EE', 
        'Power systems, telecommunications, electronics, and digital signal processing.'
    ),
    (
        'd3333333-3333-3333-3333-333333333333', 
        'Department of Mechanical Engineering', 
        'ME', 
        'Thermodynamics, robotics, fluid mechanics, design engineering, and manufacturing.'
    ),
    (
        'd4444444-4444-4444-4444-444444444444', 
        'Department of Civil Engineering', 
        'CE', 
        'Structural analysis, geotechnical engineering, surveying, and environmental engineering.'
    ),
    (
        'd5555555-5555-5555-5555-555555555555', 
        'Department of Management Sciences', 
        'MS', 
        'Bachelor of Business Administration (BBA), Accounting & Finance, and Supply Chain.'
    ),
    (
        'd6666666-6666-6666-6666-666666666666', 
        'Department of Basic Sciences & Humanities', 
        'BSH', 
        'Applied Mathematics, Physics, Chemistry, English Communication, and Islamic Studies.'
    ),
    (
        'd7777777-7777-7777-7777-777777777777', 
        'Department of Chemical & Materials Engineering', 
        'CME', 
        'Process engineering, petroleum engineering, and material science studies.'
    )
ON CONFLICT (code) DO NOTHING;

-- 4. CORE SUBJECTS
INSERT INTO public.subjects (department_id, semester_id, name, code, description, credits) VALUES
    ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Programming Fundamentals', 'CS-101', 'Introduction to algorithms, procedural programming in C/C++, pointers, and memory.', 4),
    ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Object Oriented Programming', 'CS-102', 'OOP concepts, encapsulation, polymorphism, inheritance, classes, and templates in C++ and Java.', 4),
    ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'Data Structures & Algorithms', 'CS-201', 'Stacks, queues, linked lists, trees, graphs, dynamic programming, sorting and asymptotic analysis.', 4),
    ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004', 'Database Systems', 'CS-202', 'Relational database design, ER modeling, SQL, normalization, transactions, and indexing.', 4),
    ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004', 'Operating Systems', 'CS-204', 'Process concurrency, scheduling, virtual memory management, deadlock prevention, and Linux internals.', 4),
    ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000005', 'Computer Networks', 'CS-301', 'OSI reference model, TCP/IP stack, routing protocols, subnetting, network socket programming.', 3),
    ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000006', 'Artificial Intelligence', 'CS-305', 'State-space search, heuristic algorithms, machine learning fundamentals, and neural nets.', 3),
    ('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Linear Circuit Analysis', 'EE-101', 'Kirchhoff voltage and current laws, mesh/nodal analysis, Thevenin/Norton equivalents, AC steady state.', 4),
    ('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000003', 'Digital Logic Design', 'EE-201', 'Boolean algebra, combinational logic, Karnaugh maps, sequential flip-flops, state machines, and Verilog.', 4),
    ('d3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'Engineering Thermodynamics', 'ME-102', 'First and second laws of thermodynamics, Carnot cycle, gas turbine cycles, and steam properties.', 3),
    ('d4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000003', 'Structural Mechanics', 'CE-201', 'Stress and strain transformations, bending moments, shearing force diagrams, deflection in beams.', 4),
    ('d5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Financial Accounting', 'BA-101', 'Double-entry bookkeeping, general ledger, income statements, balance sheets, cash flow auditing.', 3),
    ('d6666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Calculus & Analytical Geometry', 'MATH-101', 'Limits, differential calculus, integration techniques, curve tracing, vectors and 3D geometry.', 3),
    ('d6666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000002', 'Linear Algebra & Differential Equations', 'MATH-102', 'Matrix decompositions, eigenvalues/vectors, first/second order ODEs, and Laplace transforms.', 3)
ON CONFLICT (code) DO NOTHING;
