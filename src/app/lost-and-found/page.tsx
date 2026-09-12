'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PackageSearch, 
  PlusCircle, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Tag
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { LostFoundItem, ItemCategory, LostFoundType } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES: ItemCategory[] = [
  'ID/Card', 'Wallet', 'Keys', 'Books', 'Electronics', 
  'Documents', 'Clothing', 'Accessories', 'Other'
];

export default function LostAndFoundPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = () => {
      setItems(UniMateStore.getLostFoundItems());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    let matchesType = true;
    if (typeFilter === 'lost') matchesType = item.type === 'lost' && item.status === 'open';
    else if (typeFilter === 'found') matchesType = item.type === 'found' && item.status === 'open';
    else if (typeFilter === 'resolved') matchesType = item.status === 'resolved';

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <PackageSearch className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Campus Lost & Found Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Report missing possessions, browse discovered items, and safely reunite campus property.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lost-and-found/create?type=lost"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" /> Report Lost
          </Link>
          <Link
            href="/lost-and-found/create?type=found"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" /> Report Found
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, building, room number, or description..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold w-fit">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            typeFilter === 'all'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setTypeFilter('lost')}
          className={`px-3 py-1.5 rounded-lg transition ${
            typeFilter === 'lost'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Lost Items ({items.filter((i) => i.type === 'lost' && i.status === 'open').length})
        </button>
        <button
          onClick={() => setTypeFilter('found')}
          className={`px-3 py-1.5 rounded-lg transition ${
            typeFilter === 'found'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Found Items ({items.filter((i) => i.type === 'found' && i.status === 'open').length})
        </button>
        <button
          onClick={() => setTypeFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg transition ${
            typeFilter === 'resolved'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Reunited & Resolved ({items.filter((i) => i.status === 'resolved').length})
        </button>
      </div>

      {/* Grid of Items */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No lost or found posts found"
          description="No items match your active search filters. Report an item if you've lost or discovered something."
          actionText="Report an Item"
          actionHref="/lost-and-found/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/lost-and-found/${item.id}`}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                {/* Type & Status Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        item.type === 'lost'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  {item.status === 'resolved' ? (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Reunited
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active
                    </span>
                  )}
                </div>

                {/* Optional Item Image Preview */}
                {item.image_url && (
                  <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}

                {/* Title and Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Location & Date Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Calendar className="w-3 h-3 text-slate-400" /> {item.event_date}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-0.5">
                    Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
