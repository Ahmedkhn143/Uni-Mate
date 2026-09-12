'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowLeft, Upload, AlertCircle, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Department, Subject, ExamType } from '@/types/database';

export default function UploadPastPaperPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState<number>(3);
  const [year, setYear] = useState<number>(2025);
  const [examType, setExamType] = useState<ExamType>('midterm');
  const [title, setTitle] = useState('');
  
  const [fileName, setFileName] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const depts = UniMateStore.getDepartments();
    const subjs = UniMateStore.getSubjects();
    setDepartments(depts);
    setSubjects(subjs);

    if (depts.length > 0) {
      setDepartmentId(depts[0].id);
    }
  }, []);

  const filteredSubjects = subjects.filter((s) => s.department_id === departmentId);

  useEffect(() => {
    if (filteredSubjects.length > 0 && !subjectId) {
      setSubjectId(filteredSubjects[0].id);
    }
  }, [departmentId, filteredSubjects, subjectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only safe PDF document files are allowed.');
      e.target.value = '';
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > 25 * 1024) {
      setError('File size exceeds the 25 MB campus limit.');
      e.target.value = '';
      return;
    }

    setError('');
    setFileName(file.name);
    setFileSizeKb(sizeKb);
    if (!title) {
      const suggested = file.name.replace('.pdf', '').replace(/_/g, ' ');
      setTitle(suggested);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to contribute past examination papers.');
      return;
    }
    if (!fileName) {
      setError('Please select a PDF past paper file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter an exam paper title.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const selectedDept = departments.find((d) => d.id === departmentId);
      const selectedSubj = subjects.find((s) => s.id === subjectId);

      UniMateStore.uploadPastPaper({
        uploader: user,
        department_id: departmentId,
        department_name: selectedDept?.name || 'Department',
        subject_id: subjectId,
        subject_name: selectedSubj?.name || 'Subject',
        subject_code: selectedSubj?.code || 'GEN-101',
        semester_number: semesterNumber,
        year,
        exam_type: examType,
        title: title.trim(),
        file_name: fileName,
        file_size_kb: fileSizeKb || 1250
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/past-papers');
      }, 1500);
    } catch {
      setError('Failed to process upload. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <Link
          href="/past-papers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Past Papers
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Contribute Past Examination Paper
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload clear, legible midterm or final exams to assist fellow students in test preparation.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            {isAdmin 
              ? 'Paper published directly to the resource library!'
              : 'Paper submitted successfully! It will appear in the library upon faculty verification.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
        
        {/* File Picker Zone */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Exam Paper PDF *
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500/60 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/40 transition">
            <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {fileName ? fileName : 'Choose PDF document file'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              PDF only • Maximum file size 25 MB
            </p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="mt-3 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Paper Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Exam Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CS-201 Data Structures Midterm Examination (Solved)"
            required
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Department & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Academic Department *
            </label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setSubjectId('');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Course / Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Semester, Year, Exam Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Semester
            </label>
            <select
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Exam Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Exam Type
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value as ExamType)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="midterm">Midterm Exam</option>
              <option value="final">Final Exam</option>
              <option value="quiz">Quiz / Quiz Bank</option>
              <option value="assignment">Assignment / Project</option>
            </select>
          </div>
        </div>

        {/* Moderation notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            To preserve academic integrity, uploaded materials must be legitimate past examinations and comply with university fair-use policies.
          </span>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Link
            href="/past-papers"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {submitting ? 'Uploading...' : 'Submit Past Paper'}
          </button>
        </div>

      </form>

    </div>
  );
}
