'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Bookmark, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { PastPaper, Department, Subject, Semester } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PastPapersPage() {
  const { user } = useAuth();
  
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // PDF Preview Modal
  const [previewPaper, setPreviewPaper] = useState<PastPaper | null>(null);

  useEffect(() => {
    const load = () => {
      setPapers(UniMateStore.getPastPapers());
      setDepartments(UniMateStore.getDepartments());
      setSubjects(UniMateStore.getSubjects());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  // Filter subjects by chosen department
  const filteredSubjects = subjects.filter(
    (s) => selectedDept === 'all' || s.department_id === selectedDept
  );

  const filteredPapers = papers.filter((paper) => {
    // Only approved papers for general students (unless uploader or admin)
    const isVisible = paper.status === 'approved' || paper.uploader_id === user?.id || user?.role === 'admin';
    if (!isVisible) return false;

    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || paper.department_id === selectedDept;
    const matchesSemester = selectedSemester === 'all' || paper.semester_number === Number(selectedSemester);
    const matchesSubject = selectedSubject === 'all' || paper.subject_id === selectedSubject;
    const matchesExamType = selectedExamType === 'all' || paper.exam_type === selectedExamType;

    return matchesSearch && matchesDept && matchesSemester && matchesSubject && matchesExamType;
  });

  const handleDownload = (paper: PastPaper) => {
    UniMateStore.incrementDownload(paper.id);
  };

  const handleToggleBookmark = (paper: PastPaper) => {
    if (!user) return;
    UniMateStore.toggleBookmark({
      user_id: user.id,
      item_type: 'paper',
      item_id: paper.id,
      title: paper.title,
      category: `${paper.subject_code} • ${paper.exam_type.toUpperCase()}`,
      link: '/past-papers'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-600" />
            <span>Past Papers & Resource Archive</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse verified midterm and final examinations organized by department, semester, and course.
          </p>
        </div>

        <Link
          href="/past-papers/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
        >
          <Upload className="w-4 h-4" />
          Upload Exam Paper
        </Link>
      </div>

      {/* Hierarchical Filters & Search */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code (e.g. CS-201), exam name, or topics..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Cascading Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedSubject('all');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Course / Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Subjects</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Exam Type
            </label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="midterm">Midterm Examination</option>
              <option value="final">Final Examination</option>
              <option value="quiz">Quiz / Assessment</option>
            </select>
          </div>

        </div>

      </div>

      {/* Papers Listing Grid */}
      {filteredPapers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No past papers matching your criteria"
          description="Try adjusting your filters or upload the past paper if you have a verified copy."
          actionText="Upload Past Paper"
          actionHref="/past-papers/upload"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {paper.subject_code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Semester {paper.semester_number}
                    </span>
                  </div>

                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {paper.year} • {paper.exam_type}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {paper.subject_name} • {paper.department_name}
                  </p>
                </div>

                {paper.status === 'pending' && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
                    ⏳ Under faculty moderation review
                  </div>
                )}
              </div>

              {/* Action Buttons & Metadata */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{paper.file_size_kb} KB PDF</span>
                  <span>•</span>
                  <span>{paper.downloads} downloads</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewPaper(paper)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <a
                    href={paper.file_url}
                    download={paper.file_name}
                    onClick={() => handleDownload(paper)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => handleToggleBookmark(paper)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-purple-600"
                    title="Bookmark Paper"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {previewPaper.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {previewPaper.subject_code} • {previewPaper.year} {previewPaper.exam_type.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewPaper.file_url}
                  download={previewPaper.file_name}
                  onClick={() => handleDownload(previewPaper)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* In-Browser PDF Frame */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2">
              <iframe
                src={previewPaper.file_url}
                className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800"
                title={previewPaper.title}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
