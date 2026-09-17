'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  ExternalLink, 
  RefreshCw, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles,
  Maximize2,
  Info
} from 'lucide-react';

const GRADING_SCALE = [
  { marks: '85 - 100', grade: 'A', gpa: '4.00', desc: 'Outstanding' },
  { marks: '80 - 84', grade: 'A-', gpa: '3.66', desc: 'Excellent' },
  { marks: '75 - 79', grade: 'B+', gpa: '3.33', desc: 'Very Good' },
  { marks: '71 - 74', grade: 'B', gpa: '3.00', desc: 'Good' },
  { marks: '68 - 70', grade: 'B-', gpa: '2.66', desc: 'Fair' },
  { marks: '64 - 67', grade: 'C+', gpa: '2.33', desc: 'Satisfactory' },
  { marks: '61 - 63', grade: 'C', gpa: '2.00', desc: 'Average' },
  { marks: '58 - 60', grade: 'C-', gpa: '1.66', desc: 'Below Average' },
  { marks: '54 - 57', grade: 'D+', gpa: '1.30', desc: 'Pass' },
  { marks: '50 - 53', grade: 'D', gpa: '1.00', desc: 'Barely Pass' },
  { marks: 'Below 50', grade: 'F', gpa: '0.00', desc: 'Fail' }
];

export default function CGPACalculatorPage() {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const calculatorUrl = 'https://ahmedkhn143.github.io/KFUEIT_CGPA_Calculator/';

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Actions */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
            <Calculator className="w-4 h-4" />
            CGPA Calculator
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            title="Reload Calculator"
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Reload</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Full Width' : 'Expand Width'}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? 'Standard View' : 'Wide View'}</span>
          </button>
          <a
            href={calculatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-900/30 transition"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-emerald-950/60 via-slate-800/90 to-slate-900/90 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official KFUEIT Grading Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              KFUEIT CGPA & GPA Calculator
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Calculate semester SGPA, cumulative CGPA, grade points, and percentage conversion calibrated precisely according to Khwaja Fareed UEIT academic policies.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 block">Grading Scale</span>
              <span className="text-lg font-bold text-emerald-400">4.00 Max</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 block">Min Pass Marks</span>
              <span className="text-lg font-bold text-amber-400">50% (1.00 D)</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400 block">Degree Min CGPA</span>
              <span className="text-lg font-bold text-sky-400">2.00 / 4.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`mx-auto transition-all duration-300 ${isFullscreen ? 'max-w-[98%]' : 'max-w-7xl'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Iframe Calculator View */}
          <div className={`${isFullscreen ? 'lg:col-span-12' : 'lg:col-span-9'} flex flex-col space-y-4`}>
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden relative">
              {/* Top control bar inside card */}
              <div className="bg-slate-850 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-slate-300">kfueit_cgpa_calculator.app</span>
                </div>
                <div className="flex items-center space-x-3">
                  {isLoading && (
                    <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Loading calculator...
                    </span>
                  )}
                  <span className="hidden sm:inline text-slate-500">v2.4 Live Sync</span>
                </div>
              </div>

              {/* Iframe */}
              <div className="w-full relative min-h-[750px] sm:min-h-[850px] bg-slate-950">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 space-y-3">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-300 font-medium">Loading KFUEIT CGPA Calculator...</p>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  src={calculatorUrl}
                  title="KFUEIT CGPA Calculator"
                  className="w-full h-[780px] sm:h-[880px] border-0"
                  onLoad={() => setIsLoading(false)}
                  allow="clipboard-write"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>

              {/* Bottom footer status */}
              <div className="bg-slate-900/90 px-4 py-2.5 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Calibrated to KFUEIT Examination Rules
                </span>
                <a
                  href={calculatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-medium underline inline-flex items-center gap-1"
                >
                  Direct GitHub Link
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar: KFUEIT Grading Scale & Rules */}
          {!isFullscreen && (
            <div className="lg:col-span-3 space-y-6">
              {/* Grading Criteria Table */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/70 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    KFUEIT Grade Scale
                  </h3>
                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Official
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-2">Marks</th>
                        <th className="py-2 text-center">Grade</th>
                        <th className="py-2 text-right">GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/40 font-mono">
                      {GRADING_SCALE.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`hover:bg-slate-700/30 transition-colors ${
                            idx === 0 ? 'text-emerald-300 font-semibold' : 
                            idx >= 10 ? 'text-rose-400' : 'text-slate-300'
                          }`}
                        >
                          <td className="py-1.5 font-sans">{row.marks}</td>
                          <td className="py-1.5 text-center font-sans font-semibold">{row.grade}</td>
                          <td className="py-1.5 text-right font-bold">{row.gpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Academic Standing & Rules Card */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/70 p-5 shadow-xl space-y-3.5 text-xs text-slate-300">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  Academic Guidelines
                </h3>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="font-semibold text-emerald-400 block mb-1">Good Standing</span>
                    <span>A student maintaining a minimum CGPA of <strong>2.00 / 4.00</strong> is in good academic standing.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="font-semibold text-amber-400 block mb-1">Academic Probation</span>
                    <span>If CGPA falls below 2.00 at the end of any semester, the student is placed on academic probation.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="font-semibold text-sky-400 block mb-1">Honors & Gold Medals</span>
                    <span>Students graduating with CGPA ≥ <strong>3.75</strong> without any F/repeated courses qualify for honors.</span>
                  </div>
                </div>

                <div className="pt-2 text-slate-400 text-[11px] flex items-start gap-1.5 border-t border-slate-700/50">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>Use the embedded calculator above to test course-by-course impacts on your cumulative CGPA.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
