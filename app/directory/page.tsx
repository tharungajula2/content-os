'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatStatus } from '@/lib/formatters';

export default function DirectoryPage() {
  const [activeTab, setActiveTab] = useState<'published' | 'pipeline'>('published');
  const [videos, setVideos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    const { data } = await supabase
      .from('videos')
      .select('*')
      .or('is_archived.is.null,is_archived.eq.false');
    
    if (data) setVideos(data);
    setLoading(false);
  }

  const publishedVideos = videos
    .filter(v => v.status === 'published')
    .sort((a, b) => new Date(b.published_at || b.updated_at).getTime() - new Date(a.published_at || a.updated_at).getTime());

  const pipelineVideos = videos
    .filter(v => v.status !== 'published')
    .sort((a, b) => {
      if (!a.target_date) return 1;
      if (!b.target_date) return -1;
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    });

  const displayVideos = activeTab === 'published' ? publishedVideos : pipelineVideos;
  const filteredVideos = displayVideos.filter(v => 
    (v.final_title || v.title).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-navy text-white pb-safe">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-navy/95 backdrop-blur-xl border-b border-white/5 pt-safe px-6">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 active:text-teal transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Content Directory
            </h1>
          </div>
          <div className="w-12 shrink-0" />
        </div>

        {/* Search & Tabs */}
        <div className="pb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:border-teal/50 transition-all"
            />
          </div>

          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('published')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'published' ? 'bg-teal text-navy shadow-lg shadow-teal/20' : 'text-zinc-500'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Published
            </button>
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'pipeline' ? 'bg-amber text-navy shadow-lg shadow-amber/20' : 'text-zinc-500'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              In Pipeline
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-teal animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Indexing Content...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-sm italic">No videos found in this view</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <Link 
                key={video.id} 
                href={`/video/${video.id}`}
                className="block bg-white/5 border border-white/10 rounded-2xl p-4 active:bg-white/10 active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white/90 truncate mb-1">
                      {video.final_title || video.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'published' ? 'text-teal' : 'text-amber'}`}>
                        {activeTab === 'published' ? 'Live' : formatStatus(video.status)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {activeTab === 'published' 
                          ? new Date(video.published_at || video.updated_at).toLocaleDateString()
                          : (video.target_date ? `Due ${new Date(video.target_date).toLocaleDateString()}` : 'No Date Set')
                        }
                      </span>
                    </div>
                  </div>
                  
                  {video.youtube_url && (
                  )}
                  
                  {!video.youtube_url && (
                    <div className="shrink-0 p-2.5 text-zinc-600">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
