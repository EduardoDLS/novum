// Tipos temporales mientras no corremos `supabase gen types`.
// Reemplazar corriendo:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

import type { UserRole, ContentStatus, ScriptStatus, DeliveryStatus, ResourceType } from './novum'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          profile_id: string | null
          name: string
          instagram_handle: string | null
          bio_context: string | null
          niche: string | null
          voice_tone: string | null
          content_pillars: string[]
          followers_count: number | null
          embed_token: string | null
          instagram_photo_url: string | null
          avg_views_reel: number | null
          engagement_rate: number | null
          communication_style: string | null
          signature_phrases: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          name: string
          instagram_handle?: string | null
          bio_context?: string | null
          niche?: string | null
          voice_tone?: string | null
          content_pillars?: string[]
          followers_count?: number | null
          embed_token?: string | null
          instagram_photo_url?: string | null
          avg_views_reel?: number | null
          engagement_rate?: number | null
          communication_style?: string | null
          signature_phrases?: string | null
        }
        Update: {
          name?: string
          instagram_handle?: string | null
          bio_context?: string | null
          niche?: string | null
          voice_tone?: string | null
          content_pillars?: string[]
          followers_count?: number | null
          embed_token?: string | null
          instagram_photo_url?: string | null
          avg_views_reel?: number | null
          engagement_rate?: number | null
          communication_style?: string | null
          signature_phrases?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          client_id: string | null
          name: string
          type: ResourceType
          url: string
          tags: string[]
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          name: string
          type?: ResourceType
          url: string
          tags?: string[]
          created_by?: string | null
        }
        Update: {
          name?: string
          type?: ResourceType
          url?: string
          tags?: string[]
          client_id?: string | null
        }
        Relationships: []
      }
      content_ideas: {
        Row: {
          id: string
          client_id: string
          title: string
          status: ContentStatus
          assigned_to: string | null
          script_id: string | null
          publish_date: string | null
          views_count: number | null
          video_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          status?: ContentStatus
          assigned_to?: string | null
          script_id?: string | null
          publish_date?: string | null
          views_count?: number | null
          video_url?: string | null
        }
        Update: {
          title?: string
          status?: ContentStatus
          assigned_to?: string | null
          script_id?: string | null
          publish_date?: string | null
          views_count?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      scripts: {
        Row: {
          id: string
          content_idea_id: string
          client_id: string
          raw_idea: string
          strategic_vision: string | null
          script_content: Json | null
          status: ScriptStatus
          rejection_note: string | null
          client_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_idea_id: string
          client_id: string
          raw_idea: string
          strategic_vision?: string | null
          script_content?: Json | null
          status?: ScriptStatus
          rejection_note?: string | null
          client_notes?: string | null
        }
        Update: {
          strategic_vision?: string | null
          script_content?: Json | null
          status?: ScriptStatus
          rejection_note?: string | null
          client_notes?: string | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          id: string
          content_idea_id: string | null
          client_id: string
          editor_id: string | null
          delivery_date: string
          status: DeliveryStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_idea_id?: string | null
          client_id: string
          editor_id?: string | null
          delivery_date: string
          status?: DeliveryStatus
          notes?: string | null
        }
        Update: {
          editor_id?: string | null
          delivery_date?: string
          status?: DeliveryStatus
          notes?: string | null
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
      user_role: UserRole
      content_status: ContentStatus
      script_status: ScriptStatus
      delivery_status: DeliveryStatus
      resource_type: ResourceType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
