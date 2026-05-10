'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, RotateCcw, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCategory } from '@/lib/formatters';

export default function ArchiveVaultPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchArchivedVideos();
  }, []);

  async function fetchArchivedVideos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_archived', true)
      .order('updated_at', { ascending: false });
    
    if (data) setVideos(data);
    setLoading(false);
  }

  const handleRestore = async (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    router.refresh();
  };

  const handlePermanentDelete = async (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting video:', error);
      fetchArchivedVideos(); // Refresh if failed
    }
    setConfirmDeleteId(null);
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
              Archive Vault
            </h1>
          </div>

          <div className="w-12 shrink-0" />
        </div>
      </header>

      <main className="flex-1 p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-amber animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Opening Vault...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-zinc-400 font-bold">Vault is Empty</p>
              <p className="text-xs text-zinc-500 max-w-[200px] mt-1">Archived videos will appear here for restoration or deletion.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((video) => (
              <div 
                key={video.id}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-5 space-y-4 shadow-xl"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber mb-1 block">
                    {formatCategory(video.category)} • Archived
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight text-white/90">
                    {video.title}
                  </h3>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRestore(video.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-teal/10 text-teal border border-teal/20 py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(video.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Permanent Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-navy border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-center mb-2">Delete Forever?</h2>
            <p className="text-zinc-400 text-center text-sm mb-8 leading-relaxed">
              This action is irreversible. The video and all its data will be purged from the database.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => handlePermanentDelete(confirmDeleteId)}
                className="w-full bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-600/20"
              >
                Delete Permanently
              </button>
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="w-full bg-white/5 text-zinc-400 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
