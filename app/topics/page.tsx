'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TOPICS } from '@/lib/topics';
import { ChevronLeft, Search, CheckCircle2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCategory } from '@/lib/formatters';

export default function TopicLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [existingTopicCodes, setExistingTopicCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [spawningId, setSpawningId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExistingTopics() {
      const { data, error } = await supabase
        .from('videos')
        .select('topic_code')
        .or('is_archived.is.null,is_archived.eq.false');
      
      setLoading(false);
    }
    fetchExistingTopics();
  }, []);

  const filteredTopics = TOPICS.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.topic_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpawnVideo = async (topic: typeof TOPICS[0]) => {
    if (existingTopicCodes.includes(topic.topic_code) || spawningId) return;
    
    setSpawningId(topic.topic_code);
    
    const { data, error } = await supabase
      .from('videos')
      .insert({
        title: topic.title,
        category: topic.category,
        topic_code: topic.topic_code,
        concept_summary: topic.concept_summary,
        hook_idea: topic.hook_idea,
        best_example: topic.best_example,
        status: 'idea',
        format_type: 'concept_3min',
        priority: 'medium',
        created_by: (await supabase.auth.getUser()).data.user?.email
      })
      .select()
      .single();

    if (error) {
      console.error('Error spawning video:', error);
      setSpawningId(null);
      return;
    }

    if (data) {
      router.push(`/video/${data.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy text-white pb-safe">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-navy/95 backdrop-blur-xl border-b border-white/5 pt-safe px-6">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 active:text-teal transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </Link>
          
          <div className="flex-1 min-w-0 px-2 text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Topic Library
            </h1>
          </div>

          <div className="w-12 shrink-0" /> {/* Spacer for symmetry */}
        </div>

        {/* Search Bar */}
        <div className="pb-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-teal transition-colors" />
            <input 
              type="text" 
              placeholder="Search topics or codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-teal/50 transition-all placeholder:text-zinc-600"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-teal animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Syncing Library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTopics.map((topic) => {
              const inPipeline = existingTopicCodes.includes(topic.topic_code);
              const isSpawning = spawningId === topic.topic_code;

              return (
                <button
                  key={topic.topic_code}
                  disabled={inPipeline || isSpawning}
                  onClick={() => handleSpawnVideo(topic)}
                  className={`relative flex flex-col text-left p-5 rounded-3xl border transition-all active:scale-[0.98] ${
                    inPipeline 
                      ? 'bg-white/5 border-white/5 opacity-60' 
                      : 'bg-white/5 border-white/10 hover:border-teal/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal mb-1 block">
                        {topic.topic_code} • {formatCategory(topic.category)}
                      </span>
                      <h3 className="text-lg font-extrabold tracking-tight">
                        {topic.title}
                      </h3>
                    </div>
                    {inPipeline ? (
                      <div className="flex items-center gap-1.5 bg-teal/20 text-teal px-3 py-1 rounded-full border border-teal/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">In Pipeline</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal text-navy flex items-center justify-center shadow-lg shadow-teal/20">
                        {isSpawning ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {topic.concept_summary}
                  </p>

                  {!inPipeline && (
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hook Idea:</span>
                        <span className="text-[10px] font-bold text-zinc-300 truncate">{topic.hook_idea}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="text-center py-20">
                <p className="text-zinc-500 text-sm italic">No topics found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
