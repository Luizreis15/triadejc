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
      abandoned_cart_emails: {
        Row: {
          email_type: string
          id: string
          lead_id: string
          sent_at: string | null
        }
        Insert: {
          email_type: string
          id?: string
          lead_id: string
          sent_at?: string | null
        }
        Update: {
          email_type?: string
          id?: string
          lead_id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_cart_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      card_completions: {
        Row: {
          card_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          card_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          card_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_completions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "module_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_days: {
        Row: {
          created_at: string
          day_number: number
          heart_question: string
          id: string
          module_slug: string
          prayer_md: string
          reflection_md: string
          scripture_reference: string
          scripture_text: string
          title: string
        }
        Insert: {
          created_at?: string
          day_number: number
          heart_question: string
          id?: string
          module_slug: string
          prayer_md: string
          reflection_md: string
          scripture_reference: string
          scripture_text: string
          title: string
        }
        Update: {
          created_at?: string
          day_number?: number
          heart_question?: string
          id?: string
          module_slug?: string
          prayer_md?: string
          reflection_md?: string
          scripture_reference?: string
          scripture_text?: string
          title?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          click_count: number | null
          content_html: string
          created_at: string | null
          id: string
          open_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          segment: string | null
          sent_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          content_html: string
          created_at?: string | null
          id?: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          segment?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          content_html?: string
          created_at?: string | null
          id?: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          segment?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          email: string
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description: string
          estimated_time: number | null
          icon: string
          id: string
          module_slug: string
          order_index: number
          prompt_questions: Json
          scripture_reference: string | null
          scripture_text: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_time?: number | null
          icon?: string
          id?: string
          module_slug: string
          order_index: number
          prompt_questions?: Json
          scripture_reference?: string | null
          scripture_text?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_time?: number | null
          icon?: string
          id?: string
          module_slug?: string
          order_index?: number
          prompt_questions?: Json
          scripture_reference?: string | null
          scripture_text?: string | null
          title?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          library_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          library_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          library_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          content_md: string
          created_at: string
          format: string
          goal: string
          id: string
          stage: string
          tags: string[] | null
          title: string
          type: string
        }
        Insert: {
          content_md: string
          created_at?: string
          format: string
          goal: string
          id?: string
          stage: string
          tags?: string[] | null
          title: string
          type: string
        }
        Update: {
          content_md?: string
          created_at?: string
          format?: string
          goal?: string
          id?: string
          stage?: string
          tags?: string[] | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      module_cards: {
        Row: {
          content_md: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          module_id: string
          order_index: number
          section: string | null
          title: string
          type: string
          video_url: string | null
        }
        Insert: {
          content_md?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          module_id: string
          order_index: number
          section?: string | null
          title: string
          type: string
          video_url?: string | null
        }
        Update: {
          content_md?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          module_id?: string
          order_index?: number
          section?: string | null
          title?: string
          type?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_cards_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_days: {
        Row: {
          confession_text: string | null
          created_at: string | null
          day_in_module: number
          day_number: number
          exercise_q1: string | null
          exercise_q2: string | null
          exercise_q3: string | null
          id: string
          message_text: string
          module_id: string
          pdf_url: string | null
          title: string
          top_video_url: string | null
          verse_reference: string | null
        }
        Insert: {
          confession_text?: string | null
          created_at?: string | null
          day_in_module: number
          day_number: number
          exercise_q1?: string | null
          exercise_q2?: string | null
          exercise_q3?: string | null
          id?: string
          message_text: string
          module_id: string
          pdf_url?: string | null
          title: string
          top_video_url?: string | null
          verse_reference?: string | null
        }
        Update: {
          confession_text?: string | null
          created_at?: string | null
          day_in_module?: number
          day_number?: number
          exercise_q1?: string | null
          exercise_q2?: string | null
          exercise_q3?: string | null
          id?: string
          message_text?: string
          module_id?: string
          pdf_url?: string | null
          title?: string
          top_video_url?: string | null
          verse_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_days_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_pdfs: {
        Row: {
          card_id: string | null
          created_at: string | null
          file_url: string
          id: string
          module_id: string | null
          order_index: number | null
          title: string
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          file_url: string
          id?: string
          module_id?: string | null
          order_index?: number | null
          title: string
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          file_url?: string
          id?: string
          module_id?: string | null
          order_index?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_pdfs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "module_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_pdfs_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_free: boolean | null
          order_index: number
          slug: string
          title: string
          welcome_video_url: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          order_index: number
          slug: string
          title: string
          welcome_video_url?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          order_index?: number
          slug?: string
          title?: string
          welcome_video_url?: string | null
        }
        Relationships: []
      }
      notebook_entries: {
        Row: {
          content_md: string | null
          created_at: string
          devotional_day_id: string | null
          exercise_id: string | null
          exercise_type: string | null
          id: string
          module_slug: string | null
          section: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_md?: string | null
          created_at?: string
          devotional_day_id?: string | null
          exercise_id?: string | null
          exercise_type?: string | null
          id?: string
          module_slug?: string | null
          section: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_md?: string | null
          created_at?: string
          devotional_day_id?: string | null
          exercise_id?: string | null
          exercise_type?: string | null
          id?: string
          module_slug?: string | null
          section?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_entries_devotional_day_id_fkey"
            columns: ["devotional_day_id"]
            isOneToOne: false
            referencedRelation: "devotional_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notebook_entries_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          goal: string | null
          id: string
          is_active: boolean | null
          last_access_at: string | null
          level: string | null
          name: string | null
          niche: string | null
          onboarding_completed: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          goal?: string | null
          id: string
          is_active?: boolean | null
          last_access_at?: string | null
          level?: string | null
          name?: string | null
          niche?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          last_access_at?: string | null
          level?: string | null
          name?: string | null
          niche?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          last_seen_card_index: number | null
          module_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_seen_card_index?: number | null
          module_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_seen_card_index?: number | null
          module_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          external_id: string | null
          id: string
          payment_method: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
