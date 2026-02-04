export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          branch_code: string
          branch_name: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          region: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_code: string
          branch_name: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_code?: string
          branch_name?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      category_benchmarks: {
        Row: {
          avg_approval_rate: number | null
          avg_claim_frequency: number | null
          avg_processing_days: number | null
          avg_refund_amount: number | null
          business_category: string
          id: string
          period_end: string | null
          period_start: string | null
          sample_size: number | null
          updated_at: string
        }
        Insert: {
          avg_approval_rate?: number | null
          avg_claim_frequency?: number | null
          avg_processing_days?: number | null
          avg_refund_amount?: number | null
          business_category: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          sample_size?: number | null
          updated_at?: string
        }
        Update: {
          avg_approval_rate?: number | null
          avg_claim_frequency?: number | null
          avg_processing_days?: number | null
          avg_refund_amount?: number | null
          business_category?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          sample_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      claim_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          branch_id: string
          claim_id: string
          completed_at: string | null
          id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          branch_id: string
          claim_id: string
          completed_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          branch_id?: string
          claim_id?: string
          completed_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_assignments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_assignments_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: true
            referencedRelation: "refund_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_documents: {
        Row: {
          claim_id: string
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_at: string
        }
        Insert: {
          claim_id: string
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string
        }
        Update: {
          claim_id?: string
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_documents_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "refund_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_claim_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_claim_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_claim_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_claim_id_fkey"
            columns: ["related_claim_id"]
            isOneToOne: false
            referencedRelation: "refund_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_address: string | null
          business_category: string | null
          business_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          registration_date: string | null
          tin_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_address?: string | null
          business_category?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          registration_date?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_address?: string | null
          business_category?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          registration_date?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      refund_claims: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          claim_amount: number
          claim_number: string
          created_at: string
          currency: string | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["claim_status"]
          submitted_at: string | null
          taxpayer_id: string
          updated_at: string
          vat_period: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          claim_amount: number
          claim_number: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string | null
          taxpayer_id: string
          updated_at?: string
          vat_period: string
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          claim_amount?: number
          claim_number?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string | null
          taxpayer_id?: string
          updated_at?: string
          vat_period?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessed_at: string
          assessed_by: string | null
          assessment_details: Json | null
          auto_assessed: boolean | null
          claim_id: string
          created_at: string
          historical_analysis: Json | null
          id: string
          peer_comparison_data: Json | null
          recommendation: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
        }
        Insert: {
          assessed_at?: string
          assessed_by?: string | null
          assessment_details?: Json | null
          auto_assessed?: boolean | null
          claim_id: string
          created_at?: string
          historical_analysis?: Json | null
          id?: string
          peer_comparison_data?: Json | null
          recommendation?: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
        }
        Update: {
          assessed_at?: string
          assessed_by?: string | null
          assessment_details?: Json | null
          auto_assessed?: boolean | null
          claim_id?: string
          created_at?: string
          historical_analysis?: Json | null
          id?: string
          peer_comparison_data?: Json | null
          recommendation?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "refund_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_parameters: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          parameter_code: string
          parameter_name: string
          threshold_high: number | null
          threshold_low: number | null
          threshold_medium: number | null
          updated_at: string
          weight: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          parameter_code: string
          parameter_name: string
          threshold_high?: number | null
          threshold_low?: number | null
          threshold_medium?: number | null
          updated_at?: string
          weight?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          parameter_code?: string
          parameter_name?: string
          threshold_high?: number | null
          threshold_low?: number | null
          threshold_medium?: number | null
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          branch_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          branch_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          branch_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_states: {
        Row: {
          action_by: string | null
          action_type: string
          claim_id: string
          comments: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["claim_status"] | null
          id: string
          to_status: Database["public"]["Enums"]["claim_status"]
        }
        Insert: {
          action_by?: string | null
          action_type: string
          claim_id: string
          comments?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["claim_status"] | null
          id?: string
          to_status: Database["public"]["Enums"]["claim_status"]
        }
        Update: {
          action_by?: string | null
          action_type?: string
          claim_id?: string
          comments?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["claim_status"] | null
          id?: string
          to_status?: Database["public"]["Enums"]["claim_status"]
        }
        Relationships: [
          {
            foreignKeyName: "workflow_states_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "refund_claims"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_claim_number: { Args: never; Returns: string }
      get_user_branch: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_branch_member: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "taxpayer"
        | "officer"
        | "supervisor"
        | "risk_analyst"
        | "auditor"
        | "admin"
        | "super_admin"
        | "branch_staff"
      claim_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "risk_assessment"
        | "officer_review"
        | "supervisor_approval"
        | "approved"
        | "rejected"
        | "payment_processing"
        | "paid"
      risk_level: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "taxpayer",
        "officer",
        "supervisor",
        "risk_analyst",
        "auditor",
        "admin",
        "super_admin",
        "branch_staff",
      ],
      claim_status: [
        "draft",
        "submitted",
        "under_review",
        "risk_assessment",
        "officer_review",
        "supervisor_approval",
        "approved",
        "rejected",
        "payment_processing",
        "paid",
      ],
      risk_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
