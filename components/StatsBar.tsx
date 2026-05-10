'use client';

import { Trophy, Flame, PlayCircle } from 'lucide-react';

interface StatsBarProps {
  publishedCount: number;
  streak: number;
  pipelineCount: number;
}

export default function StatsBar({ publishedCount, streak, pipelineCount }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3 px-6 py-2">
      <StatCard
        label="Published"
        value={publishedCount}
        icon={<Trophy className="w-4 h-4 text-amber" />}
        color="bg-amber/10 text-amber border-amber/20"
      />
      <StatCard
        label="Streak"
        value={streak}
        icon={<Flame className="w-4 h-4 text-teal" />}
        color="bg-teal/10 text-teal border-teal/20"
        suffix="days"
      />
      <StatCard
        label="Pipeline"
        value={pipelineCount}
        icon={<PlayCircle className="w-4 h-4 text-category-cog" />}
        color="bg-category-cog/10 text-category-cog border-category-cog/20"
      />
    </div>
  );
}

function StatCard({ label, value, icon, color, suffix }: { label: string; value: number; icon: React.ReactNode; color: string; suffix?: string }) {
  return (
    <div className={`flex flex-col p-3 rounded-2xl border ${color} shadow-sm active:scale-95 transition-transform`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black">{value}</span>
        {suffix && <span className="text-[10px] font-bold opacity-60">{suffix}</span>}
      </div>
    </div>
  );
}
