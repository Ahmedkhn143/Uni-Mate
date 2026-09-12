'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  Search, 
  ShieldCheck, 
  User, 
  Sparkles, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Conversation, Message, Profile } from '@/types/database';

function MessagesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [newChatModal, setNewChatModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      const convs = UniMateStore.getConversations(user.id);
      setConversations(convs);
      setAllProfiles(UniMateStore.getProfiles().filter((p) => p.id !== user.id));

      const paramConv = searchParams.get('conv');
      if (paramConv) {
        setActiveConvId(paramConv);
      } else if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      }
    };

    loadData();
    return UniMateStore.subscribe(loadData);
  }, [user, searchParams, activeConvId]);

  useEffect(() => {
    if (activeConvId) {
      setMessages(UniMateStore.getMessages(activeConvId));
      scrollToBottom();
    }
  }, [activeConvId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const otherParticipant = activeConversation?.participants.find((p) => p.id !== user?.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConvId || !text.trim()) return;

    if (otherParticipant?.is_suspended) {
      alert('This recipient account has been suspended by campus moderators.');
      return;
    }

    UniMateStore.sendMessage({
      conversation_id: activeConvId,
      sender: user,
      content: text.trim()
    });

    setText('');
    scrollToBottom();
  };

  const handleStartChatWith = (target: Profile) => {
    if (!user) return;
    const conv = UniMateStore.startConversation(user, target);
    setActiveConvId(conv.id);
    setNewChatModal(false);
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Campus Messaging</h2>
        <p className="text-xs text-slate-500">Sign in to communicate with students and faculty.</p>
      </div>
    );
  }

  const filteredConvs = conversations.filter((c) => {
    const other = c.participants.find((p) => p.id !== user.id);
    return other?.full_name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: CONVERSATIONS LIST */}
      <div className="w-full md:w-80 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Messages</span>
          </h2>
          <button
            onClick={() => setNewChatModal(true)}
            className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* List of Conversations */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. Start a chat with a classmate or project partner.
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const other = conv.participants.find((p) => p.id !== user.id);
              const isActive = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition ${
                    isActive
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {other?.avatar_url ? (
                    <img src={other.avatar_url} alt={other.full_name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {other?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {other?.full_name}
                      </h4>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.last_message?.content || 'Started a new conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* 2. RIGHT CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {activeConversation && otherParticipant ? (
          <>
            {/* Chat Top Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                {otherParticipant.avatar_url ? (
                  <img src={otherParticipant.avatar_url} alt={otherParticipant.full_name} className="w-9 h-9 rounded-xl object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {otherParticipant.full_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {otherParticipant.full_name}
                    {otherParticipant.role === 'admin' && (
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Moderator
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {otherParticipant.department_name || otherParticipant.program}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Active</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
              {messages.map((m) => {
                const isMine = m.sender_id === user.id;

                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMine && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mb-1">
                        {m.sender_name.charAt(0)}
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <p>{m.content}</p>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isMine ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Message ${otherParticipant.full_name}...`}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-xs">Select a conversation or start a new message.</p>
          </div>
        )}
      </div>

      {/* START NEW CHAT MODAL */}
      {newChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Start Conversation</h3>
              <button onClick={() => setNewChatModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">×</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {allProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleStartChatWith(p)}
                  className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name} className="w-8 h-8 rounded-xl object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {p.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.full_name}</p>
                    <p className="text-[10px] text-slate-400">{p.program || p.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading messaging center...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
