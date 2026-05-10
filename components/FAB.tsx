'use client';

import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FAB({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateIdea = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      alert('You must be signed in to create ideas.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('videos')
      .insert({
        title: 'New Content Idea',
        status: 'idea',
        category: 'WEL', // Default category
        priority: 'medium',
        format_type: 'concept_3min',
        created_by: user.email,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating idea:', error);
      setLoading(false);
      return;
    }

    router.push(`/video/${data.id}`);
  };

  return (
    <button
      onClick={handleCreateIdea}
      disabled={loading}
      className="fixed bottom-8 right-6 w-16 h-16 rounded-full bg-teal text-navy shadow-2xl shadow-teal/30 flex items-center justify-center active:scale-90 transition-all z-50 disabled:opacity-50"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      ) : (
        <Plus className="w-8 h-8 stroke-[3]" />
      )}
    </button>
  );
}
