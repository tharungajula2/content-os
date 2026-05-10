import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';
import StatsBar from '@/components/StatsBar';
import KanbanBoard from '@/components/KanbanBoard';
import FAB from '@/components/FAB';
import Link from 'next/link';
import { BookOpen, List, Archive } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch/Create Gamification Stats
  let { data: gamification } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_email', user.email!)
    .single();

  if (!gamification && user.email) {
    const { data: newStats } = await supabase
      .from('gamification')
      .insert({ 
        user_email: user.email,
        xp_points: 0,
        total_published: 0,
        current_streak: 0,
        badges: []
      })
      .select()
      .single();
    gamification = newStats;
  }

  // 2. Fetch Active Videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .or('is_archived.is.null,is_archived.eq.false')
    .order('updated_at', { ascending: false });

  return (
    <main className="flex min-h-screen flex-col bg-navy text-white pb-24">
      {/* Premium Header */}
      <header className="p-6 pt-12 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            MISSION<br/>
            <span className="text-teal">CONTROL</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Content OS v1.0</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/settings"
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 active:scale-95 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-teal/20 border border-teal/40" />
          </Link>
          <SignOutButton />
        </div>
      </header>

      {/* Stats Bar Component */}
      <StatsBar stats={gamification} />

      {/* Quick Navigation Tabs */}
      <nav className="px-6 mb-8">
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          <Link href="/topics" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 active:bg-white/5 transition-all whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5 text-teal" />
            Topics
          </Link>
          <Link href="/directory" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 active:bg-white/5 transition-all whitespace-nowrap">
            <List className="w-3.5 h-3.5 text-amber" />
            Directory
          </Link>
          <Link href="/archive" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 active:bg-white/5 transition-all whitespace-nowrap">
            <Archive className="w-3.5 h-3.5 text-zinc-500" />
            Archive
          </Link>
        </div>
      </nav>

      {/* Kanban Board Component */}
      <KanbanBoard initialVideos={videos || []} />

      {/* Floating Action Button */}
      <FAB />
    </main>
  );
}
