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
          status: string
          category: string
          topic_code: string | null
          priority: string | null
          format_type: string | null
          concept_summary: string | null
          hook_idea: string | null
          best_example: string | null
          script_final: string | null
          script_notes: string | null
          verification_accuracy: number | null
          verification_pedagogy: number | null
          verification_notes: string | null
          approved_by_1: boolean | null
          approved_by_2: boolean | null
          final_title: string | null
          youtube_url: string | null
          is_archived: boolean | null
          is_xp_awarded: boolean | null
          created_by: string
          target_date: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          status?: string
          category?: string
          topic_code?: string | null
          priority?: string | null
          format_type?: string | null
          concept_summary?: string | null
          hook_idea?: string | null
          best_example?: string | null
          script_final?: string | null
          script_notes?: string | null
          verification_accuracy?: number | null
          verification_pedagogy?: number | null
          verification_notes?: string | null
          approved_by_1?: boolean | null
          approved_by_2?: boolean | null
          final_title?: string | null
          youtube_url?: string | null
          is_archived?: boolean | null
          is_xp_awarded?: boolean | null
          created_by: string
          target_date?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          status?: string
          category?: string
          topic_code?: string | null
          priority?: string | null
          format_type?: string | null
          concept_summary?: string | null
          hook_idea?: string | null
          best_example?: string | null
          script_final?: string | null
          script_notes?: string | null
          verification_accuracy?: number | null
          verification_pedagogy?: number | null
          verification_notes?: string | null
          approved_by_1?: boolean | null
          approved_by_2?: boolean | null
          final_title?: string | null
          youtube_url?: string | null
          is_archived?: boolean | null
          is_xp_awarded?: boolean | null
          created_by?: string
          target_date?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      video_topics: {
        Row: {
          id: string
          title: string
          category: string
          relevance_score: number
          is_spawned: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          relevance_score?: number
          is_spawned?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          relevance_score?: number
          is_spawned?: boolean
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      video_notes: {
        Row: {
          id: string
          video_id: string
          content: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          content: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          content?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_notes_video_id_fkey"
            columns: ["video_id"]
            referencedRelation: "videos"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            referencedRelation: "videos"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "video_links_video_id_fkey"
            columns: ["video_id"]
            referencedRelation: "videos"
            referencedColumns: ["id"]
          }
        ]
      }
      gamification: {
        Row: {
          id: string
          user_email: string
          xp_points: number
          current_streak: number
          total_published: number
          last_publish_date: string | null
          badges: string[]
        }
        Insert: {
          id?: string
          user_email: string
          xp_points?: number
          current_streak?: number
          total_published?: number
          last_publish_date?: string | null
          badges?: string[]
        }
        Update: {
          id?: string
          user_email?: string
          xp_points?: number
          current_streak?: number
          total_published?: number
          last_publish_date?: string | null
          badges?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
