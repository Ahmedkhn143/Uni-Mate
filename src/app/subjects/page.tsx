'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, FileText, HelpCircle, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { UniMateStore } from '@/lib/store';
import { Subject, Department, PastPaper, Question } from '@/types/database';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = () => {
      setSubjects(UniMateStore.getSubjects());
      setDepartments(UniMateStore.getDepartments());
      setPapers(UniMateStore.getPastPapers());
      setQuestions(UniMateStore.getQuestions());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  const filtered = subjects.filter((s) => {
    const matchesDept = selectedDept === 'all' || s.department_id === selectedDept;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <span>University Subject Directory</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore courses across departments, syllabus details, exam papers, and discussion threads.
        </p>
      </div>

      {/* Search and Department Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code or subject title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Academic Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((subject) => {
          const relatedPapers = papers.filter((p) => p.subject_id === subject.id);
          const relatedQuestions = questions.filter((q) => q.subject_id === subject.id);

          return (
            <div
              key={subject.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {subject.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    Semester {subject.semester_number || 3} • {subject.credits} Credits
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {subject.description}
                  </p>
                </div>
              </div>

              {/* Related Resources Links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{relatedPapers.length}</span> papers
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{relatedQuestions.length}</span> Q&A
                  </span>
                </div>

                <Link
                  href={`/past-papers`}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Explore Course <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
