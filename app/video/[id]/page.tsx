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
  const params = useParams();
  const id = params?.id as string;
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
    if (!id) return;
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
    if (!video || !id) return;
    setSaving(true);
    const { error } = await supabase
      .from('videos')
      .update({ ...video, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) console.error('Error saving video:', error);
    setSaving(false);
    router.refresh();
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserEmail || !id) return;
    const { data, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: id,
        user_email: currentUserEmail,
        content: newComment
      })
      .select()
      .single();

    if (data) {
      setComments([...comments, data]);
      setNewComment('');
    }
  };

  const handleAddLink = async () => {
    if (!newLink.url.trim() || !currentUserEmail || !id) return;
    const { data, error } = await supabase
      .from('video_links')
      .insert({
        video_id: id,
        url: newLink.url,
        description: newLink.description,
        added_by: currentUserEmail
      })
      .select()
      .single();

    if (data) {
      setLinks([...links, data]);
      setNewLink({ url: '', description: '' });
    }
  };

  const handleToggleApproval = async (userNum: 1 | 2) => {
    if (!video || !id) return;
    const field = userNum === 1 ? 'approved_by_1' : 'approved_by_2';
    const newValue = !video[field];
    
    setVideo({ ...video, [field]: newValue });
    
    await supabase
      .from('videos')
      .update({ [field]: newValue } as any)
      .eq('id', id);
  };

  const handleArchive = async () => {
    if (!id) return;
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
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-navy/95 backdrop-blur-xl border-b border-white/5 pt-safe px-6">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 text-zinc-400 active:text-teal transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
             <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-teal text-navy px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-2 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-teal shadow-lg border border-teal/20' 
                  : 'text-zinc-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Title Section */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal/70">Working Title</span>
              <input 
                value={video.title}
                onChange={(e) => setVideo({...video, title: e.target.value})}
                className="w-full bg-transparent text-3xl font-black italic tracking-tighter outline-none placeholder:text-white/10"
                placeholder="Name your masterpiece..."
              />
            </div>

            {/* Grid Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Status</label>
                <select 
                  value={video.status}
                  onChange={(e) => setVideo({...video, status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:border-teal/50"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Category</label>
                <select 
                  value={video.category}
                  onChange={(e) => setVideo({...video, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:border-teal/50"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{formatCategory(c)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Format</label>
                <select 
                  value={video.format_type}
                  onChange={(e) => setVideo({...video, format_type: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:border-teal/50"
                >
                  {FORMATS.map(f => <option key={f} value={f}>{formatFormatType(f)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Priority</label>
                <select 
                  value={video.priority}
                  onChange={(e) => setVideo({...video, priority: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:border-teal/50"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{formatPriority(p)}</option>)}
                </select>
              </div>
            </div>

            {/* Concept Summary */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Concept Summary</label>
              <textarea 
                value={video.concept_summary || ''}
                onChange={(e) => setVideo({...video, concept_summary: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm leading-relaxed outline-none focus:border-teal/50 min-h-[120px]"
                placeholder="What's the core idea?"
              />
            </div>

            {/* Archive Button */}
            <div className="pt-8 border-t border-white/5">
              <button 
                onClick={() => setShowArchiveConfirm(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Archive Video
              </button>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal/70">Final Script</label>
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden min-h-[400px]">
                <TipTapEditor 
                  value={video.script_final || ''} 
                  onChange={(val) => setVideo({...video, script_final: val})} 
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Script Notes</label>
              <textarea 
                value={video.script_notes || ''}
                onChange={(e) => setVideo({...video, script_notes: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm leading-relaxed outline-none focus:border-teal/50 min-h-[150px]"
                placeholder="Drafting notes, hooks, and research links..."
              />
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-amber/5 border border-amber/10 rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-3 text-amber">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Quality Assurance</h3>
                </div>
                <p className="text-xs text-amber/70 leading-relaxed">
                  Every video must pass accuracy and pedagogy checks before being marked as Finalized.
                </p>
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Accuracy (0-100)</label>
                    <span className="text-xl font-black italic text-teal">{video.verification_accuracy || 0}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={video.verification_accuracy || 0}
                    onChange={(e) => setVideo({...video, verification_accuracy: parseInt(e.target.value)})}
                    className="w-full accent-teal"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pedagogy (0-100)</label>
                    <span className="text-xl font-black italic text-amber">{video.verification_pedagogy || 0}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={video.verification_pedagogy || 0}
                    onChange={(e) => setVideo({...video, verification_pedagogy: parseInt(e.target.value)})}
                    className="w-full accent-amber"
                  />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Verification Notes</label>
                <textarea 
                  value={video.verification_notes || ''}
                  onChange={(e) => setVideo({...video, verification_notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm leading-relaxed outline-none focus:border-teal/50 min-h-[120px]"
                  placeholder="Any corrections or pedagogy improvements?"
                />
             </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Add Link or Asset</h3>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-3">
                  <input 
                    placeholder="URL (Drive, Figma, YouTube...)"
                    value={newLink.url}
                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-teal/30"
                  />
                  <div className="flex gap-2">
                    <input 
                      placeholder="Description"
                      value={newLink.description}
                      onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-teal/30"
                    />
                    <button 
                      onClick={handleAddLink}
                      className="bg-teal text-navy px-4 rounded-xl active:scale-95 transition-all"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>
                </div>
             </div>

             <div className="space-y-3">
               {links.map((link) => (
                 <a 
                   key={link.id} 
                   href={link.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl active:bg-white/10 transition-colors"
                 >
                   <div className="w-10 h-10 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0">
                     <LinkIcon className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold truncate">{link.description || link.url}</p>
                     <p className="text-[10px] text-zinc-500 truncate">{link.url}</p>
                   </div>
                 </a>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="flex flex-col h-[calc(100vh-280px)] animate-in fade-in duration-500">
             {/* Chat Messages */}
             <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No notes yet</p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const isMe = comment.user_email === currentUserEmail;
                    return (
                      <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          isMe ? 'bg-teal text-navy rounded-tr-none font-medium' : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                        }`}>
                          {comment.content}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1.5 px-1">
                          {isMe ? 'Me' : comment.user_email.split('@')[0]} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
             </div>

             {/* Chat Input */}
             <div className="pt-4 mt-auto">
               <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 pl-4 focus-within:border-teal/50 transition-all">
                 <input 
                   placeholder="Type a team note..."
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                   className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                 />
                 <button 
                  onClick={handleAddComment}
                  className="bg-teal text-navy p-3 rounded-xl active:scale-95 transition-all shadow-lg shadow-teal/20"
                 >
                   <Send className="w-4 h-4" />
                 </button>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'published' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal/70">Final YouTube URL</label>
                <div className="flex gap-2">
                  <input 
                    value={video.youtube_url || ''}
                    onChange={(e) => setVideo({...video, youtube_url: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-teal/50"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {video.youtube_url && (
                    <a 
                      href={video.youtube_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-red-500 text-white p-4 rounded-2xl active:scale-95 transition-all"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </a>
                  )}
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Final Public Title</label>
                <input 
                  value={video.final_title || ''}
                  onChange={(e) => setVideo({...video, final_title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-teal/50"
                  placeholder="The title that viewers see..."
                />
             </div>

             <div className="pt-8 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 text-center">Team Approvals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleToggleApproval(1)}
                    className={`flex items-center justify-center gap-3 py-6 rounded-3xl border transition-all ${
                      video.approved_by_1 ? 'bg-teal text-navy border-teal' : 'bg-white/5 border-white/10 text-zinc-500'
                    }`}
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Master 01</span>
                  </button>
                  <button 
                    onClick={() => handleToggleApproval(2)}
                    className={`flex items-center justify-center gap-3 py-6 rounded-3xl border transition-all ${
                      video.approved_by_2 ? 'bg-teal text-navy border-teal' : 'bg-white/5 border-white/10 text-zinc-500'
                    }`}
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Master 02</span>
                  </button>
                </div>
             </div>

             {video.approved_by_1 && video.approved_by_2 && !video.is_xp_awarded && (
               <div className="bg-teal/10 border border-teal/20 rounded-[2.5rem] p-8 text-center space-y-4 animate-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-teal text-navy rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter">MISSION COMPLETE</h3>
                    <p className="text-xs text-teal/70 font-medium">Both masters have signed off. Ready for deployment.</p>
                  </div>
               </div>
             )}
          </div>
        )}
      </main>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" onClick={() => setShowArchiveConfirm(false)} />
          <div className="relative bg-navy border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-center mb-2 text-white">Move to Archive?</h2>
            <p className="text-zinc-400 text-center text-sm mb-8 leading-relaxed font-medium">
              This will remove the video from the main dashboard and move it to the Archive Vault.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleArchive}
                className="w-full bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-600/20"
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

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
