'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HelpCircle, 
  ThumbsUp, 
  CheckCircle2, 
  MessageSquare, 
  Bookmark, 
  Flag, 
  ArrowLeft, 
  Clock, 
  Share2, 
  Send,
  Sparkles,
  Trash2,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Question, Answer } from '@/types/database';
import { ReportModal } from '@/components/ui/ReportModal';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [replyComments, setReplyComments] = useState<{ [key: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; type: 'question' | 'answer'; title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = () => {
      const q = UniMateStore.getQuestionById(questionId);
      if (q) {
        setQuestion(q);
        setAnswers(UniMateStore.getAnswers(questionId));
        if (user) {
          setIsBookmarked(UniMateStore.isBookmarked(user.id, 'question', questionId));
        }
      }
    };

    load();
    return UniMateStore.subscribe(load);
  }, [questionId, user]);

  if (!question) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Question Not Found</h2>
        <p className="text-xs text-slate-500">This question may have been removed or does not exist.</p>
        <Link href="/questions" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Q&A Hub
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === question.author_id;

  const handleVoteQuestion = () => {
    UniMateStore.voteQuestion(question.id, 'up');
  };

  const handleVoteAnswer = (answerId: string) => {
    UniMateStore.voteAnswer(answerId, 'up');
  };

  const handleAcceptAnswer = (answerId: string) => {
    UniMateStore.acceptAnswer(question.id, answerId);
  };

  const handleToggleBookmark = () => {
    if (!user) return;
    const newState = UniMateStore.toggleBookmark({
      user_id: user.id,
      item_type: 'question',
      item_id: question.id,
      title: question.title,
      category: question.department_name,
      link: `/questions/${question.id}`
    });
    setIsBookmarked(newState);
  };

  const handleDeleteQuestion = () => {
    if (confirm('Are you sure you want to remove this question?')) {
      UniMateStore.deleteQuestion(question.id);
      router.push('/questions');
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnswerContent.trim()) return;

    setIsSubmitting(true);
    UniMateStore.addAnswer({
      question_id: question.id,
      author: user,
      content: newAnswerContent.trim()
    });
    setNewAnswerContent('');
    setIsSubmitting(false);
  };

  const handleAddComment = (answerId: string) => {
    const text = replyComments[answerId]?.trim();
    if (!user || !text) return;

    UniMateStore.addComment({
      parent_type: 'answer',
      parent_id: answerId,
      author: user,
      content: text
    });

    setReplyComments({ ...replyComments, [answerId]: '' });
    setActiveReplyBox(null);
  };

  // Sort answers: accepted first, then by upvotes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.is_accepted) return -1;
    if (b.is_accepted) return 1;
    return (b.upvotes || 0) - (a.upvotes || 0);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Back link */}
      <div>
        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Q&A Hub
        </Link>
      </div>

      {/* 1. MAIN QUESTION CARD */}
      <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        
        {/* Header Tags & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
              {question.department_name}
            </span>
            {question.subject_name && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • {question.subject_name}
              </span>
            )}
            {question.is_resolved && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Asked {new Date(question.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
          {question.title}
        </h1>

        {/* Question Body */}
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed space-y-3 font-sans">
          {question.description}
        </div>

        {/* Optional Image */}
        {question.image_url && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-96">
            <img src={question.image_url} alt="Question diagram" className="w-full h-auto object-contain" />
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {question.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Action Controls & Author Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleVoteQuestion}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                question.user_voted === 'up'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{question.upvotes} Upvotes</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border text-xs transition ${
                isBookmarked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
              }`}
              title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark question'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => {
                setReportTarget({ id: question.id, type: 'question', title: question.title });
                setReportModalOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 transition"
              title="Report question"
            >
              <Flag className="w-4 h-4" />
            </button>

            {(isAuthor || isAdmin) && (
              <button
                onClick={handleDeleteQuestion}
                className="p-2 rounded-xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Author Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            {question.author_avatar ? (
              <img src={question.author_avatar} alt={question.author_name} className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {question.author_name.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{question.author_name}</div>
              <div className="text-[10px] text-slate-400">{question.author_department || 'Student'}</div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. ANSWERS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</span>
          </h2>
        </div>

        {sortedAnswers.map((ans) => (
          <div
            key={ans.id}
            className={`p-4 sm:p-6 rounded-3xl border transition ${
              ans.is_accepted
                ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
            }`}
          >
            {/* Accepted Answer Badge */}
            {ans.is_accepted && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Accepted Solution</span>
              </div>
            )}

            <div className="flex items-start gap-3 sm:gap-4">
              
              {/* Upvote Answer Button */}
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                <button
                  onClick={() => handleVoteAnswer(ans.id)}
                  className={`p-1 rounded-lg transition hover:scale-110 ${
                    ans.user_voted === 'up'
                      ? 'text-indigo-600'
                      : 'text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">{ans.upvotes}</span>
              </div>

              {/* Content & Comments */}
              <div className="flex-1 space-y-4 min-w-0">
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {ans.content}
                </div>

                {/* Answer Author and Accept Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mark as accepted button for question author */}
                    {isAuthor && !ans.is_accepted && (
                      <button
                        onClick={() => handleAcceptAnswer(ans.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Answer
                      </button>
                    )}

                    <button
                      onClick={() => setActiveReplyBox(activeReplyBox === ans.id ? null : ans.id)}
                      className="text-slate-500 hover:text-indigo-600 font-semibold"
                    >
                      Reply / Comment
                    </button>

                    <button
                      onClick={() => {
                        setReportTarget({ id: ans.id, type: 'answer', title: `Answer by ${ans.author_name}` });
                        setReportModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      Report
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {ans.author_avatar ? (
                      <img src={ans.author_avatar} alt={ans.author_name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {ans.author_name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{ans.author_name}</span>
                    <span className="text-slate-400">• {new Date(ans.created_at).toLocaleDateString()}</span>
                  </div>

                </div>

                {/* Comments List */}
                {ans.comments && ans.comments.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-indigo-200 dark:border-slate-700 space-y-2 text-xs">
                    {ans.comments.map((c) => (
                      <div key={c.id} className="py-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 mr-1.5">{c.author_name}:</span>
                        <span className="text-slate-600 dark:text-slate-400">{c.content}</span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Comment Reply Box */}
                {activeReplyBox === ans.id && (
                  <div className="mt-2 flex gap-2 pt-2">
                    <input
                      type="text"
                      value={replyComments[ans.id] || ''}
                      onChange={(e) => setReplyComments({ ...replyComments, [ans.id]: e.target.value })}
                      placeholder="Add a constructive comment or clarification..."
                      className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleAddComment(ans.id)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Post
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        ))}
      </div>

      {/* 3. ANSWER SUBMISSION FORM */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Your Answer
        </h3>

        {user ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <textarea
              value={newAnswerContent}
              onChange={(e) => setNewAnswerContent(e.target.value)}
              rows={6}
              placeholder="Write a clear, thorough answer with explanations, code examples, or proofs. Help fellow students learn."
              required
              className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Adhere to academic honor code: explain logic rather than sharing graded homework solutions.
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !newAnswerContent.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Posting...' : 'Post Your Answer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <p className="text-xs text-slate-500">You must be logged in to answer questions.</p>
            <Link href="/login" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
              Sign In to Answer
            </Link>
          </div>
        )}
      </div>

      {/* Universal Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          itemType={reportTarget.type}
          itemId={reportTarget.id}
          itemTitle={reportTarget.title}
        />
      )}

    </div>
  );
}
