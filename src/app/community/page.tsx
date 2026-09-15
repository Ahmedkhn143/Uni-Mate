'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  Pin, 
  Sparkles, 
  Flag, 
  Send, 
  Image as ImageIcon,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Post, PostCategory } from '@/types/database';
import { ReportModal } from '@/components/ui/ReportModal';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES: { value: PostCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Feeds' },
  { value: 'discussion', label: 'General Discussions' },
  { value: 'announcement', label: 'Campus Announcements' },
  { value: 'study_help', label: 'Study Groups & Help' },
  { value: 'resource', label: 'Resource Sharing' }
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');
  
  // New Post Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<PostCategory>('discussion');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postTagInput, setPostTagInput] = useState('');
  const [postTags, setPostTags] = useState<string[]>([]);
  const [postIsAnonymous, setPostIsAnonymous] = useState(false);
  
  // Inline Comment State
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  // Report State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const load = () => {
      setPosts(UniMateStore.getPosts(user?.role, user?.id));
    };
    load();
    return UniMateStore.subscribe(load);
  }, [user]);

  const handleLike = (postId: string) => {
    UniMateStore.toggleLikePost(postId);
  };

  const handleAddTag = () => {
    const clean = postTagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (clean && !postTags.includes(clean) && postTags.length < 5) {
      setPostTags([...postTags, clean]);
      setPostTagInput('');
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postTitle.trim() || !postContent.trim()) return;

    UniMateStore.createPost({
      author: user,
      category: postCategory,
      title: postTitle.trim(),
      content: postContent.trim(),
      tags: postTags,
      image_url: postImageUrl.trim() || undefined,
      is_anonymous: postIsAnonymous
    });

    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
    setPostTags([]);
    setCreateModalOpen(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!user || !text) return;

    UniMateStore.addComment({
      parent_type: 'post',
      parent_id: postId,
      author: user,
      content: text
    });

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const filteredPosts = posts.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Community Feed</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect with campus clubs, announcements, study sessions, and peer discussions.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeCategory === cat.value
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No posts in this channel"
          description="Start the discussion by creating a post for your fellow students!"
          actionText="Create Post"
          onActionClick={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm space-y-4 ${
                post.is_pinned
                  ? 'border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Author Row & Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {post.is_anonymous ? (
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : post.author_avatar ? (
                    <img src={post.author_avatar} alt={post.author_name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {post.author_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {post.is_anonymous ? 'Anonymous Student' : post.author_name}
                      </span>
                      {post.author_role === 'admin' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Staff
                        </span>
                      )}
                      {post.is_anonymous && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5 text-indigo-500" /> Anonymous
                        </span>
                      )}
                    </div>

                    {/* ADMIN VIEW ONLY: Display verified real identity & registration number */}
                    {(user?.role === 'admin' || user?.role === 'moderator') && post.is_anonymous && (
                      <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-200 font-mono">
                        <Shield className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span>Admin Verified: <strong>{post.author_real_name || post.author_name}</strong> {post.author_reg_no ? `• ${post.author_reg_no}` : ''}</span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.is_pinned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {post.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Title & Content */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {post.content}
                </p>
              </div>

              {/* Optional Image */}
              {post.image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80">
                  <img src={post.image_url} alt="Post media" className="w-full h-auto object-cover" />
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Reactions Bar & Comment Toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                      post.user_liked
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
                    <span className="font-bold">{post.likes}</span>
                  </button>

                  <button
                    onClick={() => setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments_count || 0} Comments</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setReportTarget({ id: post.id, title: post.title });
                    setReportModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                  title="Report Post"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Section */}
              {openCommentsPostId === post.id && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  {post.comments && post.comments.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {post.comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{c.author_name}</span>
                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No comments yet. Start the conversation!</p>
                  )}

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Add a comment..."
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* CREATE POST MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create Campus Post</h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Channel / Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as PostCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="discussion">General Discussion</option>
                  <option value="study_help">Study Groups & Peer Help</option>
                  <option value="resource">Resource Sharing</option>
                  <option value="announcement">Campus Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Post Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Forming a study group for upcoming CS-302 finals"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                  placeholder="Share details, room numbers, dates, or study goals..."
                  required
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Optional Image URL</label>
                <input
                  type="url"
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                  placeholder="https://example.com/flyer.jpg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Anonymous Post Toggle */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setPostIsAnonymous((v) => !v)}
                  className={`relative shrink-0 mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    postIsAnonymous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      postIsAnonymous ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="space-y-0.5">
                  <label
                    onClick={() => setPostIsAnonymous((v) => !v)}
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3 text-indigo-500" />
                    <span>Publish Anonymously</span>
                  </label>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your post will show as <strong>"Anonymous Student"</strong> to fellow students. Campus admins always retain verified faculty access.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          itemType="post"
          itemId={reportTarget.id}
          itemTitle={reportTarget.title}
        />
      )}

    </div>
  );
}
