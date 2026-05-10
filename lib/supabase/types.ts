export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          subscription_status: 'free' | 'pro' | null
          subscription_period_end: string | null
          stripe_customer_id: string | null
          active_skin: string
          owned_skins: string[]
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'pro' | null
          subscription_period_end?: string | null
          stripe_customer_id?: string | null
          active_skin?: string
          owned_skins?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'pro' | null
          subscription_period_end?: string | null
          stripe_customer_id?: string | null
          active_skin?: string
          owned_skins?: string[]
          created_at?: string
        }
      }
      puzzles: {
        Row: {
          id: string
          difficulty: string
          givens: number[]
          solution: number[]
          technique_tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          difficulty: string
          givens: number[]
          solution: number[]
          technique_tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          difficulty?: string
          givens?: number[]
          solution?: number[]
          technique_tags?: string[]
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          user_id: string
          puzzle_id: string
          current_state: number[]
          notes: Json
          mistake_count: number
          hints_used: number
          time_elapsed_seconds: number
          status: 'active' | 'completed' | 'abandoned'
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          puzzle_id: string
          current_state?: number[]
          notes?: Json
          mistake_count?: number
          hints_used?: number
          time_elapsed_seconds?: number
          status?: 'active' | 'completed' | 'abandoned'
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          current_state?: number[]
          notes?: Json
          mistake_count?: number
          hints_used?: number
          time_elapsed_seconds?: number
          status?: 'active' | 'completed' | 'abandoned'
          completed_at?: string | null
        }
      }
      daily_puzzles: {
        Row: { date: string; puzzle_id: string }
        Insert: { date: string; puzzle_id: string }
        Update: { puzzle_id?: string }
      }
      daily_results: {
        Row: {
          user_id: string
          date: string
          time_seconds: number
          mistakes: number
        }
        Insert: {
          user_id: string
          date: string
          time_seconds: number
          mistakes?: number
        }
        Update: { time_seconds?: number; mistakes?: number }
      }
      hint_usage: {
        Row: { user_id: string; date: string; count: number }
        Insert: { user_id: string; date: string; count?: number }
        Update: { count?: number }
      }
      ai_messages: {
        Row: {
          id: string
          user_id: string
          game_id: string | null
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id?: string | null
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: never
      }
    }
  }
}
