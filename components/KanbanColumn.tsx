'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import VideoCard from './VideoCard';
import { Database } from '@/types/database';

type Video = Database['public']['Tables']['videos']['Row'];

interface KanbanColumnProps {
  status: string;
  videos: Video[];
  onMoveNext?: (id: string, currentStatus: string) => void;
  onMovePrev?: (id: string, currentStatus: string) => void;
}

export default function KanbanColumn({ status, videos, onMoveNext, onMovePrev }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div 
      className="flex-shrink-0 w-[85vw] md:w-80 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          {status}
          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-zinc-400">
            {videos.length}
          </span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3 min-h-[50vh] bg-white/[0.02] border border-white/[0.05] rounded-3xl p-3"
      >
        <SortableContext
          items={videos.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          {videos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              onMoveNext={onMoveNext}
              onMovePrev={onMovePrev}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
