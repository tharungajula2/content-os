'use client';

export const dynamic = 'force-dynamic';

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
      const { data } = await supabase
        .from('videos')
        .select('topic_code')
        .or('is_archived.is.null,is_archived.eq.false');
      
      if (data) {
        setExistingTopicCodes(data.map(v => v.topic_code).filter(Boolean) as string[]);
      }
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
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      alert('You must be signed in to spawn videos.');
      setSpawningId(null);
      return;
    }

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
        created_by: user.email
      })
      .select()
      .single();

    if (error) {
      console.error('Error spawning video:', error);
      alert('Failed to spawn video: ' + error.message);
      setSpawningId(null);
    } else {
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
          <div className="flex-1 text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Topic Library
            </h1>
          </div>
          <div className="w-12 shrink-0" />
        </div>

        {/* Search Bar */}
        <div className="pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:border-teal/50 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-teal animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading Library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTopics.map((topic) => {
              const isInPipeline = existingTopicCodes.includes(topic.topic_code);
              const isSpawning = spawningId === topic.topic_code;

              return (
                <div 
                  key={topic.topic_code}
                  onClick={() => !isInPipeline && handleSpawnVideo(topic)}
                  className={`relative overflow-hidden group bg-white/5 border rounded-[2rem] p-6 transition-all active:scale-[0.98] ${
                    isInPipeline 
                      ? 'border-white/5 opacity-50 grayscale' 
                      : 'border-white/10 active:bg-white/10'
                  }`}
                >
                  <div className="relative z-10 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal/70 mb-1 block">
                        {formatCategory(topic.category)}
                      </span>
                      <h3 className="text-lg font-extrabold tracking-tight text-white/90 leading-tight">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2 font-medium">
                        {topic.concept_summary}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isInPipeline ? (
                        <div className="bg-teal/10 text-teal p-3 rounded-2xl">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : isSpawning ? (
                        <div className="bg-teal text-navy p-3 rounded-2xl animate-pulse">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      ) : (
                        <div className="bg-white/10 text-white p-3 rounded-2xl group-active:bg-teal group-active:text-navy transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {isInPipeline && (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy/20 backdrop-blur-[2px]">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 rotate-12">
                        In Pipeline
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
