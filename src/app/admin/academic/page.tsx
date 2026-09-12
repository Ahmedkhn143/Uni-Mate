'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Building, PlusCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Department, Subject } from '@/types/database';
import { AdminAccessDenied } from '@/components/ui/AdminAccessDenied';

export default function AdminAcademicPage() {
  const { isAdmin } = useAuth();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // New Department Form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  
  // New Subject Form
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjDeptId, setSubjDeptId] = useState('');
  const [subjSemester, setSubjSemester] = useState(1);
  const [subjDesc, setSubjDesc] = useState('');
  const [subjCredits, setSubjCredits] = useState(3);

  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = () => {
      const d = UniMateStore.getDepartments();
      const s = UniMateStore.getSubjects();
      setDepartments(d);
      setSubjects(s);
      if (d.length > 0 && !subjDeptId) {
        setSubjDeptId(d[0].id);
      }
    };
    load();
    return UniMateStore.subscribe(load);
  }, [subjDeptId]);

  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    UniMateStore.addDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      description: deptDesc.trim()
    });

    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setMessage('Department successfully created!');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleAddSubj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim() || !subjCode.trim()) return;

    const dept = departments.find((d) => d.id === subjDeptId);

    UniMateStore.addSubject({
      department_id: subjDeptId,
      department_name: dept?.name,
      semester_number: subjSemester,
      name: subjName.trim(),
      code: subjCode.trim().toUpperCase(),
      description: subjDesc.trim(),
      credits: Number(subjCredits)
    });

    setSubjName('');
    setSubjCode('');
    setSubjDesc('');
    setMessage('Course / Subject added to academic registry!');
    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Suite
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Academic Registry Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure university departments, semester offerings, and accredited course codes.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Two Column Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Add Department Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            Add Academic Department
          </h2>

          <form onSubmit={handleAddDept} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Department Name *</label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Mechanical Engineering"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Code / Abbreviation *</label>
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                placeholder="e.g. ME"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                rows={2}
                placeholder="Academic field overview..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
            >
              Add Department
            </button>
          </form>

          {/* Existing Departments List */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Active Departments ({departments.length})</h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {departments.map((d) => (
                <div key={d.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                  <span className="font-bold">{d.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded font-mono">{d.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Subject Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            Add Accredited Subject
          </h2>

          <form onSubmit={handleAddSubj} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Name *</label>
              <input
                type="text"
                value={subjName}
                onChange={(e) => setSubjName(e.target.value)}
                placeholder="e.g. Artificial Intelligence & Heuristics"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code *</label>
                <input
                  type="text"
                  value={subjCode}
                  onChange={(e) => setSubjCode(e.target.value)}
                  placeholder="e.g. CS-401"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={subjDeptId}
                  onChange={(e) => setSubjDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                <select
                  value={subjSemester}
                  onChange={(e) => setSubjSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Credits</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={subjCredits}
                  onChange={(e) => setSubjCredits(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Syllabus Overview</label>
              <textarea
                value={subjDesc}
                onChange={(e) => setSubjDesc(e.target.value)}
                rows={2}
                placeholder="Key topics and learning outcomes..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition"
            >
              Add Course to Catalog
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
