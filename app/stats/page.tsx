'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Trophy, Flame, Play, Star, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Gamification {
  xp_points: number;
  current_streak: number;
  total_published: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_email', user.email!)
        .single();
      
      if (data) setStats(data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  const xp = stats?.xp_points || 0;
  
  // Level Calculation
  let level = 1;
  let nextXP = 500;
  let prevXP = 0;
  
  if (xp >= 3500) {
    level = 4; // Max for now
    nextXP = 10000;
    prevXP = 3500;
  } else if (xp >= 1500) {
    level = 3;
    nextXP = 3500;
    prevXP = 1500;
  } else if (xp >= 500) {
    level = 2;
    nextXP = 1500;
    prevXP = 500;
  }

  const progress = ((xp - prevXP) / (nextXP - prevXP)) * 100;

  const badges = [
    { id: 'first_blood', name: 'First Blood', description: '1 video published', icon: <Play className="w-6 h-6" />, unlocked: (stats?.total_published || 0) >= 1 },
    { id: 'streak_lord', name: 'Streak Lord', description: '4-week streak', icon: <Flame className="w-6 h-6" />, unlocked: (stats?.current_streak || 0) >= 28 },
    { id: 'century', name: 'Century', description: '100 videos published', icon: <Star className="w-6 h-6" />, unlocked: (stats?.total_published || 0) >= 100 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-navy text-white pb-safe">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-navy/95 backdrop-blur-xl border-b border-white/5 pt-safe px-6">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 active:text-teal transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Team Stats
            </h1>
          </div>
          <div className="w-12 shrink-0" />
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Level Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="w-24 h-24 text-teal" />
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal/70 mb-2 block">Current Rank</span>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-5xl font-black italic tracking-tighter">LVL {level}</h2>
              <span className="text-zinc-500 font-bold uppercase text-xs">{xp} XP TOTAL</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>Progress to LVL {level + 1}</span>
                <span className="text-teal">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className="h-full bg-teal rounded-full shadow-[0_0_15px_rgba(22,199,154,0.4)] transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-1">
             <Trophy className="w-6 h-6 text-teal mb-2" />
             <span className="text-3xl font-black italic">{stats?.total_published || 0}</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Published</span>
          </div>
          <div className="bg-amber/5 border border-amber/10 rounded-3xl p-6 flex flex-col gap-1">
             <Flame className="w-6 h-6 text-amber mb-2" />
             <span className="text-3xl font-black italic text-amber">{stats?.current_streak || 0}</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-amber/60">Active Streak</span>
          </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Achievement Badges</h3>
          <div className="grid grid-cols-1 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`flex items-center gap-5 p-5 rounded-3xl border transition-all ${
                  badge.unlocked 
                    ? 'bg-teal/5 border-teal/20 text-white' 
                    : 'bg-white/5 border-white/5 text-zinc-500 opacity-40'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  badge.unlocked ? 'bg-teal text-navy' : 'bg-white/10'
                }`}>
                  {badge.unlocked ? badge.icon : <Lock className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-black uppercase tracking-widest ${badge.unlocked ? 'text-teal' : ''}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[10px] font-medium opacity-70 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
