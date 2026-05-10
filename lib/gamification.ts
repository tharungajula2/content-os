import { supabase } from './supabase';

/**
 * Awards XP to a user when they publish a video.
 * Ensures XP is only awarded once per video.
 */
export async function awardPublishXP(videoId: string, userEmail: string) {
  // 1. Check if video already awarded XP
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('is_xp_awarded, status')
    .eq('id', videoId)
    .single();

  if (videoError || !video) return { error: 'Video not found' };
  if (video.is_xp_awarded || video.status !== 'published') return { success: true }; // Already awarded or not published

  // 2. Update gamification table
  const { data: currentStats, error: statsError } = await supabase
    .from('gamification')
    .select('xp_points, total_published')
    .eq('user_email', userEmail)
    .single();

  if (statsError || !currentStats) return { error: 'Gamification record not found' };

  const today = new Date().toISOString().split('T')[0];

  const { error: updateStatsError } = await supabase
    .from('gamification')
    .update({
      xp_points: (currentStats.xp_points || 0) + 100,
      total_published: (currentStats.total_published || 0) + 1,
      last_publish_date: today,
    })
    .eq('user_email', userEmail);

  if (updateStatsError) return { error: 'Failed to update stats' };

  // 3. Mark video as XP awarded
  const { error: updateVideoError } = await supabase
    .from('videos')
    .update({ is_xp_awarded: true })
    .eq('id', videoId);

  if (updateVideoError) return { error: 'Failed to mark video as XP awarded' };

  return { success: true };
}
