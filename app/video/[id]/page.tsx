'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { 
  ChevronLeft, 
  Save, 
  Layout, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  Link as LinkIcon, 
  Trash2, 
  AlertTriangle, 
  Send,
  Play,
  ShieldCheck
} from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import { awardPublishXP } from '@/lib/gamification';
import { formatStatus, formatCategory, formatFormatType, formatPriority } from '@/lib/formatters';

type Video = Database['public']['Tables']['videos']['Row'];
type Comment = Database['public']['Tables']['video_comments']['Row'];
type Link = Database['public']['Tables']['video_links']['Row'];

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Layout className="w-4 h-4" /> },
  { id: 'script', label: 'Script', icon: <FileText className="w-4 h-4" /> },
  { id: 'verification', label: 'Verification', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'media', label: 'Media & Links', icon: <LinkIcon className="w-4 h-4" /> },
  { id: 'team', label: 'Team Notes', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'published', label: 'Published', icon: <Play className="w-4 h-4" /> },
];

const CATEGORIES = ['COG', 'HUM', 'RSN', 'SDB', 'WEL'];
const FORMATS = ['concept_3min', 'deep_dive', 'sandbox'];
const STATUSES = ['idea', 'scripting', 'production', 'review', 'published'];
const PRIORITIES = ['low', 'medium', 'high'];

const STATUS_MAPPING: Record<string, string> = {
  research: 'scripting',
  'visual planning': 'scripting',
  recording: 'production',
  editing: 'production',
  finalized: 'review',
};

export default function VideoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newLink, setNewLink] = useState({ url: '', description: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserEmail(user.email!);

    const [videoRes, commentsRes, linksRes] = await Promise.all([
      supabase.from('videos').select('*').eq('id', id).single(),
      supabase.from('video_comments').select('*').eq('video_id', id).order('created_at', { ascending: true }),
      supabase.from('video_links').select('*').eq('video_id', id)
    ]);

    if (videoRes.data) {
      const v = videoRes.data;
      setVideo({
        ...v,
        status: STATUS_MAPPING[v.status] || v.status
      });
    }
    if (commentsRes.data) setComments(commentsRes.data);
    if (linksRes.data) setLinks(linksRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!video) return;
    setSaving(true);
    const { error } = await supabase
      .from('videos')
      .update({ ...video, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) console.error('Error saving video:', error);
    
    if (video.status === 'published') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await awardPublishXP(id as string, user.email);
      }
    }
    
    setSaving(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: id as string,
        user_email: user.email!,
        content: newComment // Use 'content' as per schema
      })
      .select()
      .single();

    if (data) {
      setComments([...comments, data]);
      setNewComment('');
    }
  };

  const handleAddLink = async () => {
    if (!newLink.url.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('video_links')
      .insert({
        video_id: id as string,
        url: newLink.url,
        description: newLink.description,
        added_by: user.email!
      })
      .select()
      .single();

    if (data) {
      setLinks([...links, data]);
      setNewLink({ url: '', description: '' });
    }
  };

  const handleToggleApproval = async (userNum: 1 | 2) => {
    if (!video) return;
    const field = userNum === 1 ? 'approved_by_1' : 'approved_by_2';
    const newValue = !video[field];
    
    setVideo({ ...video, [field]: newValue });
    
    await supabase
      .from('videos')
      .update({ [field]: newValue })
      .eq('id', id);
  };

  const handleArchive = async () => {
    const { error } = await supabase
      .from('videos')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      console.error('Error archiving video:', error);
      return;
    }

    router.push('/');
    router.refresh();
  };

  if (loading) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!video) return <div>Video not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-navy text-white pb-safe">
      <header className="sticky top-0 z-50 w-full bg-navy/95 backdrop-blur-xl border-b border-white/5 pt-safe px-6">
        <div className="flex items-center gap-4 h-16">
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-zinc-400 active:text-teal transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </button>
          <div className="flex-1 min-w-0 px-2">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 truncate">
              {video.title}
            </h1>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-teal text-navy px-5 py-2.5 rounded-full text-xs font-black uppercase active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            {saving ? <div className="w-3 h-3 border-2 border-navy border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </header>

      <div className="sticky top-16 z-40 bg-navy/95 backdrop-blur-md border-b border-white/5 flex overflow-x-auto hide-scrollbar shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap text-xs font-bold uppercase tracking-widest ${
              activeTab === tab.id 
                ? 'border-teal text-teal bg-teal/5' 
                : 'border-transparent text-zinc-500'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-4">
              <Field label="Video Title">
                <input 
                  type="text" 
                  value={video.title || ''} 
                  onChange={e => setVideo({...video, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select 
                    value={video.category || ''} 
                    onChange={e => setVideo({...video, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all cursor-pointer text-white appearance-none"
                    style={{ 
                      colorScheme: 'dark',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.2em'
                    }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-navy text-white">{formatCategory(c)}</option>)}
                  </select>
                </Field>
                <Field label="Format">
                  <select 
                    value={video.format_type || ''} 
                    onChange={e => setVideo({...video, format_type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all cursor-pointer text-white appearance-none"
                    style={{ 
                      colorScheme: 'dark',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.2em'
                    }}
                  >
                    {FORMATS.map(f => <option key={f} value={f} className="bg-navy text-white">{formatFormatType(f)}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select 
                    value={video.status || ''} 
                    onChange={e => setVideo({...video, status: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all cursor-pointer text-white appearance-none"
                    style={{ 
                      colorScheme: 'dark',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.2em'
                    }}
                  >
                    {STATUSES.map(s => <option key={s} value={s} className="bg-navy text-white">{formatStatus(s)}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select 
                    value={video.priority || ''} 
                    onChange={e => setVideo({...video, priority: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all cursor-pointer text-white appearance-none"
                    style={{ 
                      colorScheme: 'dark',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.2em'
                    }}
                  >
                    {PRIORITIES.map(p => <option key={p} value={p} className="bg-navy text-white">{formatPriority(p)}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Target Date">
                <input 
                  type="date" 
                  value={video.target_date || ''} 
                  onChange={e => setVideo({...video, target_date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                />
              </Field>

              <Field label="Concept Summary">
                <textarea 
                  rows={4}
                  value={video.concept_summary || ''} 
                  onChange={e => setVideo({...video, concept_summary: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all resize-none"
                />
              </Field>

              <Field label="Hook Idea">
                <textarea 
                  rows={3}
                  value={video.hook_idea || ''} 
                  onChange={e => setVideo({...video, hook_idea: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all resize-none"
                />
              </Field>

              <Field label="Best Example">
                <textarea 
                  rows={3}
                  value={video.best_example || ''} 
                  onChange={e => setVideo({...video, best_example: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all resize-none"
                />
              </Field>

              <div className="pt-8 border-t border-white/5">
                <button 
                  onClick={() => setShowArchiveConfirm(true)}
                  className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Archive Video
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <Field label="Draft / Notes">
                <TipTapEditor 
                  value={video.script_notes || ''} 
                  onChange={val => setVideo({...video, script_notes: val})}
                  placeholder="Start brainstorming..."
                />
              </Field>
              <Field label="Final Verified Script">
                <TipTapEditor 
                  value={video.script_final || ''} 
                  onChange={val => setVideo({...video, script_final: val})}
                  placeholder="Paste final script here..."
                  className="bg-teal/5 border-teal/20"
                />
              </Field>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
               <Field label="Accuracy (1-10)">
                  <input 
                    type="number" min="1" max="10"
                    value={video.verification_accuracy || 0} 
                    onChange={e => setVideo({...video, verification_accuracy: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                  />
                </Field>
                <Field label="Pedagogy (1-10)">
                  <input 
                    type="number" min="1" max="10"
                    value={video.verification_pedagogy || 0} 
                    onChange={e => setVideo({...video, verification_pedagogy: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                  />
                </Field>
            </div>
            <Field label="Verification Notes (AI Feedback)">
              <textarea 
                rows={8}
                value={video.verification_notes || ''} 
                onChange={e => setVideo({...video, verification_notes: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
              />
            </Field>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Add New Link</h3>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 space-y-4">
                <input 
                  type="url" placeholder="URL"
                  value={newLink.url}
                  onChange={e => setNewLink({...newLink, url: e.target.value})}
                  className="w-full bg-navy border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-teal"
                />
                <input 
                  type="text" placeholder="Description"
                  value={newLink.description}
                  onChange={e => setNewLink({...newLink, description: e.target.value})}
                  className="w-full bg-navy border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-teal"
                />
                <button 
                  onClick={handleAddLink}
                  className="w-full bg-teal text-navy py-3 rounded-xl text-xs font-black uppercase active:scale-95 transition-all"
                >
                  Add Media Link
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Resources</h3>
              {links.map(link => (
                <a key={link.id} href={link.url} target="_blank" className="block bg-white/5 p-4 rounded-2xl border border-white/10 active:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal/10 rounded-lg"><LinkIcon className="w-4 h-4 text-teal" /></div>
                    <div>
                      <p className="text-sm font-bold text-white/90">{link.description || 'Reference Link'}</p>
                      <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{link.url}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col h-full">
            <div className="grid grid-cols-2 gap-4 shrink-0">
               <button 
                onClick={() => handleToggleApproval(1)}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${
                  video.approved_by_1 ? 'bg-teal text-navy border-teal' : 'bg-white/5 text-zinc-500 border-white/10'
                }`}
               >
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-70">User 1</span>
                 <span className="text-sm font-bold">{video.approved_by_1 ? 'APPROVED' : 'APPROVE'}</span>
               </button>
               <button 
                onClick={() => handleToggleApproval(2)}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${
                  video.approved_by_2 ? 'bg-teal text-navy border-teal' : 'bg-white/5 text-zinc-500 border-white/10'
                }`}
               >
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-70">User 2</span>
                 <span className="text-sm font-bold">{video.approved_by_2 ? 'APPROVED' : 'APPROVE'}</span>
               </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto min-h-[300px] p-2">
              {comments.map(c => {
                const isMe = c.user_email === currentUserEmail;
                return (
                  <div 
                    key={c.id} 
                    className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      isMe ? 'bg-teal text-navy rounded-tr-none' : 'bg-white/5 text-white border border-white/10 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{c.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        {c.user_email.split('@')[0]}
                      </span>
                      <span className="text-[9px] text-zinc-600">
                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 shrink-0 pb-10 pt-4">
              <input 
                type="text" placeholder="Type a note..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
              />
              <button 
                onClick={handleAddComment}
                className="w-14 h-14 bg-teal text-navy rounded-2xl flex items-center justify-center active:scale-90 transition-all"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'published' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <Field label="YouTube URL">
                <input 
                  type="url" 
                  value={video.youtube_url || ''} 
                  onChange={e => setVideo({...video, youtube_url: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </Field>
              <Field label="Final Title">
                <input 
                  type="text" 
                  value={video.final_title || ''} 
                  onChange={e => setVideo({...video, final_title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                />
              </Field>
              <Field label="Tags (Comma Separated)">
                <input 
                  type="text" 
                  value={video.tags?.join(', ') || ''} 
                  onChange={e => setVideo({...video, tags: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                />
              </Field>
              <Field label="Analytics Notes">
                <textarea 
                  rows={6}
                  value={video.analytics_notes || ''} 
                  onChange={e => setVideo({...video, analytics_notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:border-teal outline-none transition-all"
                />
              </Field>
          </div>
        )}

      </main>

      {showArchiveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" onClick={() => setShowArchiveConfirm(false)} />
          <div className="relative bg-navy border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-center mb-2">Archive Video?</h2>
            <p className="text-zinc-400 text-center text-sm mb-8 leading-relaxed">
              This will move the video to the Archive Vault. You can restore it later if needed.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleArchive}
                className="w-full bg-red-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                Confirm Archive
              </button>
              <button 
                onClick={() => setShowArchiveConfirm(false)}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
      {children}
    </div>
  );
}
