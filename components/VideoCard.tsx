'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { GripVertical, ArrowRight, ArrowLeft } from 'lucide-react';
import { Database } from '@/types/database';
import { formatCategory, formatPriority } from '@/lib/formatters';

type Video = Database['public']['Tables']['videos']['Row'];

interface VideoCardProps {
  video: Video;
  onMoveNext?: (id: string, currentStatus: string) => void;
  onMovePrev?: (id: string, currentStatus: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'WEL': '#27ae60',
  'COG': '#2980b9',
  'RSN': '#8e44ad',
  'HUM': '#e67e22',
  'SDB': '#95a5a6',
};

export default function VideoCard({ video, onMoveNext, onMovePrev }: VideoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const categoryColor = CATEGORY_COLORS[video.category] || '#95a5a6';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <Link href={`/video/${video.id}`} className="block">
        <div 
          className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl shadow-lg active:scale-[0.98] transition-all min-h-[5rem]"
        >
          <div className="flex justify-between items-start gap-3 mr-6">
            <h3 className="text-sm font-semibold leading-tight text-white/90 line-clamp-2">
              {video.title}
            </h3>
            <span 
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
              style={{ 
                backgroundColor: `${categoryColor}20`, 
                borderColor: `${categoryColor}40`,
                color: categoryColor 
              }}
            >
              {formatCategory(video.category)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5">
              <div 
                className={`w-2 h-2 rounded-full ${
                  video.priority === 'high' ? 'bg-amber animate-pulse' : 
                  video.priority === 'medium' ? 'bg-teal' : 'bg-zinc-500'
                }`} 
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {formatPriority(video.priority)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
               {onMovePrev && video.status !== 'idea' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMovePrev(video.id, video.status);
                  }}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-500" />
                </button>
              )}

              {onMoveNext && video.status !== 'published' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMoveNext(video.id, video.status);
                  }}
                  className="w-8 h-8 rounded-full bg-teal text-navy flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-teal/20"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Dedicated Drag Handle - touch-none is critical */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none text-white/20 hover:text-teal/50 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
    </div>
  );
}
