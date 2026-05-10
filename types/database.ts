export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          title: string
          category: string
          topic_code: string | null
          format_type: string
          status: string
          priority: string
          concept_summary: string | null
          hook_idea: string | null
          best_example: string | null
          script_notes: string | null
          script_final: string | null
          verification_accuracy: number | null
          verification_pedagogy: number | null
          verification_notes: string | null
          youtube_url: string | null
          final_title: string | null
          tags: string[] | null
          analytics_notes: string | null
          created_by: string
          created_at: string
          updated_at: string
          target_date: string | null
          published_at: string | null
          approved_by_1: boolean
          approved_by_2: boolean
          is_xp_awarded: boolean
          is_archived: boolean
        }
        Insert: {
          id?: string
          title: string
          category: string
          topic_code?: string | null
          format_type: string
          status: string
          priority: string
          concept_summary?: string | null
          hook_idea?: string | null
          best_example?: string | null
          script_notes?: string | null
          script_final?: string | null
          verification_accuracy?: number | null
          verification_pedagogy?: number | null
          verification_notes?: string | null
          youtube_url?: string | null
          final_title?: string | null
          tags?: string[] | null
          analytics_notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          target_date?: string | null
          published_at?: string | null
          approved_by_1?: boolean
          approved_by_2?: boolean
          is_xp_awarded?: boolean
          is_archived?: boolean
        }
        Update: {
          id?: string
          title?: string
          category?: string
          topic_code?: string | null
          format_type?: string
          status?: string
          priority?: string
          concept_summary?: string | null
          hook_idea?: string | null
          best_example?: string | null
          script_notes?: string | null
          script_final?: string | null
          verification_accuracy?: number | null
          verification_pedagogy?: number | null
          verification_notes?: string | null
          youtube_url?: string | null
          final_title?: string | null
          tags?: string[] | null
          analytics_notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          target_date?: string | null
          published_at?: string | null
          approved_by_1?: boolean
          approved_by_2?: boolean
          is_xp_awarded?: boolean
          is_archived?: boolean
        }
      }
      video_comments: {
        Row: {
          id: string
          video_id: string
          user_email: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          user_email: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          user_email?: string
          content?: string
          created_at?: string
        }
      }
      video_links: {
        Row: {
          id: string
          video_id: string
          url: string
          description: string | null
          added_by: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          url: string
          description?: string | null
          added_by: string
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          url?: string
          description?: string | null
          added_by?: string
          created_at?: string
        }
      }
      gamification: {
        Row: {
          id: string
          user_email: string
          xp_points: number
          current_streak: number
          total_published: number
          last_publish_date: string | null
        }
        Insert: {
          id?: string
          user_email: string
          xp_points?: number
          current_streak?: number
          total_published?: number
          last_publish_date?: string | null
        }
        Update: {
          id?: string
          user_email?: string
          xp_points?: number
          current_streak?: number
          total_published?: number
          last_publish_date?: string | null
        }
      }
    }
  }
}
