import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';
import StatsBar from '@/components/StatsBar';
import KanbanBoard from '@/components/KanbanBoard';
import FAB from '@/components/FAB';
import Link from 'next/link';
import { BookOpen, List, Archive } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch/Create Gamification Stats
  let { data: gamification } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_email', user.email!)
    .single();

  if (!gamification) {
    const { data: newStats } = await supabase
      .from('gamification')
      .insert({
        user_email: user.email!,
        xp_points: 0,
        current_streak: 0,
        total_published: 0
      })
      .select()
      .single();
    gamification = newStats;
  }

  // 2. Fetch Videos
  const { data: videos = [] } = await supabase
    .from('videos')
    .select('*')
    .or('is_archived.is.null,is_archived.eq.false')
    .order('created_at', { ascending: false });

  const pipelineCount = (videos || []).filter(v => v.status !== 'published').length;

  return (
    <div className="flex min-h-screen flex-col bg-navy text-white overflow-hidden">
      {/* Polished Sticky Mobile Header */}

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Stats Section */}
        <Link href="/stats" className="shrink-0 mt-4 active:scale-95 transition-transform block">
          <StatsBar 
            publishedCount={gamification?.total_published || 0}
            streak={gamification?.current_streak || 0}
            pipelineCount={pipelineCount}
          />
        </Link>

        {/* Kanban Section */}
        <div className="flex-1 flex flex-col min-h-0 mt-6">
          <KanbanBoard initialVideos={videos || []} />
        </div>
      </main>

      {/* FAB - Using ID for creation */}
      <FAB userId={user.id} />

      {/* Hidden Sign Out - accessible via profile menu later, but keeping button for now in a hidden or bottom section if needed */}
      {/* For now, I'll place it at the very end of the horizontal scroll or in a settings drawer later */}
    </div>
  );
}
