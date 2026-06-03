export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole        = "participant" | "admin" | "callcenter"
export type PrizeStatus     = "available" | "pending" | "delivered"
export type MatchStage      = "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final"
export type PredictionResult = "pending" | "correct_winner" | "correct_exact" | "correct_diff" | "wrong"
export type LeadSource      = "taller" | "repuestos" | "digital" | "qr" | "direct"

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          dni: string
          phone: string
          email: string
          license_plate: string
          car_brand: string
          car_model: string
          city: string
          lead_source: LeadSource
          accepts_terms: boolean
          accepts_marketing: boolean
          is_blocked: boolean
          total_points: number
          ranking_position: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          dni: string
          phone: string
          email: string
          license_plate: string
          car_brand?: string
          car_model?: string
          city?: string
          lead_source?: LeadSource
          accepts_terms: boolean
          accepts_marketing?: boolean
          is_blocked?: boolean
          total_points?: number
          ranking_position?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          team1: string
          team2: string
          team1_flag: string
          team2_flag: string
          match_date: string
          stage: MatchStage
          group_name: string | null
          venue: string | null
          score1: number | null
          score2: number | null
          is_finished: boolean
          predictions_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team1: string
          team2: string
          team1_flag?: string
          team2_flag?: string
          match_date: string
          stage?: MatchStage
          group_name?: string | null
          venue?: string | null
          score1?: number | null
          score2?: number | null
          is_finished?: boolean
          predictions_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>
        Relationships: []
      }
      predictions: {
        Row: {
          id: string
          participant_id: string
          match_id: string
          predicted_score1: number
          predicted_score2: number
          points_earned: number
          result: PredictionResult
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          match_id: string
          predicted_score1: number
          predicted_score2: number
          points_earned?: number
          result?: PredictionResult
          submitted_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["predictions"]["Insert"]>
        Relationships: []
      }
      point_config: {
        Row: {
          id: string
          correct_winner: number
          correct_exact: number
          correct_diff: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          correct_winner?: number
          correct_exact?: number
          correct_diff?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["point_config"]["Insert"]>
        Relationships: []
      }
      prizes: {
        Row: {
          id: string
          title: string
          description: string | null
          stage: string
          prize_type: string
          status: PrizeStatus
          winner_id: string | null
          delivered_at: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          stage: string
          prize_type?: string
          status?: PrizeStatus
          winner_id?: string | null
          delivered_at?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["prizes"]["Insert"]>
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: UserRole
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>
        Relationships: []
      }
    }
    Views: {
      ranking_view: {
        Row: {
          participant_id: string
          first_name: string
          last_name: string
          total_points: number
          correct_exact: number
          correct_winner: number
          ranking_position: number
        }
        Relationships: []
      }
    }
    Functions: {
      recalculate_points: {
        Args: { p_match_id: string }
        Returns: undefined
      }
      get_participant_stats: {
        Args: { p_participant_id: string }
        Returns: {
          total_points: number
          ranking_position: number
          predictions_count: number
          correct_exact: number
          correct_winner: number
        }[]
      }
    }
  }
}
