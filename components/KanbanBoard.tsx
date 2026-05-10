'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import VideoCard from './VideoCard';
import { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { awardPublishXP } from '@/lib/gamification';

type Video = Database['public']['Tables']['videos']['Row'];

const COLUMNS = [
  'idea', 'scripting', 'production', 'review', 'published'
];

const STATUS_MAPPING: Record<string, string> = {
  research: 'scripting',
  'visual planning': 'scripting',
  recording: 'production',
  editing: 'production',
  finalized: 'review',
};

interface KanbanBoardProps {
  initialVideos: Video[];
}

export default function KanbanBoard({ initialVideos }: KanbanBoardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [videos, setVideos] = useState<Video[]>(initialVideos.map(v => ({
    ...v,
    status: STATUS_MAPPING[v.status] || v.status
  })));
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [activeColumn, setActiveColumn] = useState('idea');

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleMoveNext = async (id: string, currentStatus: string) => {
    const currentIndex = COLUMNS.indexOf(currentStatus);
    if (currentIndex >= COLUMNS.length - 1) return;
    
    const nextStatus = COLUMNS[currentIndex + 1];

    // Optimistic Update
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: nextStatus } : v));

    // Supabase Update
    const { error } = await supabase
      .from('videos')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Failed to move to next stage:', error);
    }

    if (nextStatus === 'published') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await awardPublishXP(id, user.email);
        router.refresh();
      }
    }
  };

  const handleMovePrev = async (id: string, currentStatus: string) => {
    const currentIndex = COLUMNS.indexOf(currentStatus);
    if (currentIndex <= 0) return;
    
    const prevStatus = COLUMNS[currentIndex - 1];

    // Optimistic Update
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: prevStatus } : v));

    // Supabase Update
    const { error } = await supabase
      .from('videos')
      .update({ status: prevStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Failed to move to previous stage:', error);
    }
  };

  const scrollToColumn = (status: string) => {
    const element = document.getElementById(`column-${status}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setActiveColumn(status);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const video = videos.find((v) => v.id === event.active.id);
    if (video) setActiveVideo(video);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeVideo = videos.find(v => v.id === activeId);
    if (!activeVideo) return;

    // Is it dropping over a column or another card?
    let overStatus = overId as string;
    if (!COLUMNS.includes(overStatus)) {
        const overVideo = videos.find(v => v.id === overId);
        if (overVideo) overStatus = overVideo.status;
    }

    if (activeVideo.status !== overStatus) {
        setVideos((prev) => {
            const activeIndex = prev.findIndex((v) => v.id === activeId);
            const newVideos = [...prev];
            newVideos[activeIndex] = { ...activeVideo, status: overStatus };
            return newVideos;
        });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const videoId = active.id as string;
    const overId = over.id as string;

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    // Check if over is a column or a card
    let newStatus = overId;
    if (!COLUMNS.includes(overId as any)) {
        // Find column of the card we are over
        const overVideo = videos.find(v => v.id === overId);
        if (overVideo) newStatus = overVideo.status;
    }

    if (video.status !== newStatus) {
        // Optimistic update
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: newStatus } : v));

        // Supabase update
        const { error } = await supabase
            .from('videos')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', videoId);

        if (error) {
            console.error('Failed to update status:', error);
        }

        if (newStatus === 'published') {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                await awardPublishXP(videoId, user.email);
                router.refresh();
            }
        }
    }

    setActiveVideo(null);
  };

  if (!mounted) return <div className="flex-1 px-6"><div className="w-full h-64 bg-white/5 animate-pulse rounded-3xl" /></div>;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Quick-Jump Tab Bar */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-6 py-4 shrink-0">
        {COLUMNS.map((status) => (
          <button
            key={status}
            onClick={() => scrollToColumn(status)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              activeColumn === status 
                ? 'bg-teal text-navy border-teal shadow-lg shadow-teal/20' 
                : 'bg-white/5 text-zinc-500 border-white/10 active:bg-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex-1 overflow-x-auto snap-x snap-mandatory flex gap-4 px-6 pb-24 scrollbar-hide mt-4">
          {COLUMNS.map((status) => (
            <div key={status} id={`column-${status}`} className="snap-center shrink-0">
              <KanbanColumn
                status={status}
                videos={videos.filter((v) => v.status === status)}
                onMoveNext={handleMoveNext}
                onMovePrev={handleMovePrev}
              />
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeVideo ? <VideoCard video={activeVideo} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
