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
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          email: string
          status: 'active' | 'inactive' | 'prospect'
          phone: string | null
          company: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          email: string
          status?: 'active' | 'inactive' | 'prospect'
          phone?: string | null
          company?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          email?: string
          status?: 'active' | 'inactive' | 'prospect'
          phone?: string | null
          company?: string | null
          notes?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          client_id: string
          title: string
          description: string | null
          budget: number
          status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          deadline: string | null
          start_date: string | null
          actual_end_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          client_id: string
          title: string
          description?: string | null
          budget: number
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          deadline?: string | null
          start_date?: string | null
          actual_end_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          client_id?: string
          title?: string
          description?: string | null
          budget?: number
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          deadline?: string | null
          start_date?: string | null
          actual_end_date?: string | null
        }
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
