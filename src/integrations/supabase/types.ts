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
      calendar_items: {
        Row: {
          created_at: string
          id: string
          library_item_id: string | null
          scheduled_date: string
          status: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          library_item_id?: string | null
          scheduled_date: string
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          library_item_id?: string | null
          scheduled_date?: string
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_items_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Relationships: []
      }
      notebook_entries: {
        Row: {
          content_md: string | null
          created_at: string
          id: string
          section: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_md?: string | null
          created_at?: string
          id?: string
          section: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_md?: string | null
          created_at?: string
          id?: string
          section?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          goal: string | null
          id: string
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
      results: {
        Row: {
          created_at: string
          dms: number | null
          id: string
          notes: string | null
          post_date: string
          post_url: string | null
          reach: number | null
          saves: number | null
          screenshot_url: string | null
          shares: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dms?: number | null
          id?: string
          notes?: string | null
          post_date: string
          post_url?: string | null
          reach?: number | null
          saves?: number | null
          screenshot_url?: string | null
          shares?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          dms?: number | null
          id?: string
          notes?: string | null
          post_date?: string
          post_url?: string | null
          reach?: number | null
          saves?: number | null
          screenshot_url?: string | null
          shares?: number | null
          user_id?: string
        }
        Relationships: []
      }
      script_blocks: {
        Row: {
          allow_price: boolean | null
          awareness_tags: string[] | null
          created_at: string | null
          est_seconds: number | null
          goal_tags: string[] | null
          id: string
          is_active: boolean | null
          product_id: string | null
          text_content: string
          tone_tags: string[] | null
          type: string
          usage_count: number | null
        }
        Insert: {
          allow_price?: boolean | null
          awareness_tags?: string[] | null
          created_at?: string | null
          est_seconds?: number | null
          goal_tags?: string[] | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          text_content: string
          tone_tags?: string[] | null
          type: string
          usage_count?: number | null
        }
        Update: {
          allow_price?: boolean | null
          awareness_tags?: string[] | null
          created_at?: string | null
          est_seconds?: number | null
          goal_tags?: string[] | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          text_content?: string
          tone_tags?: string[] | null
          type?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "script_blocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "script_products"
            referencedColumns: ["id"]
          },
        ]
      }
      script_products: {
        Row: {
          checkout_url: string | null
          created_at: string | null
          forbidden_words: string[] | null
          guarantee_days: number | null
          id: string
          is_active: boolean | null
          name: string
          niche: string | null
          price: number | null
          promise: string | null
          tone_tags: string[] | null
          whatsapp_url: string | null
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string | null
          forbidden_words?: string[] | null
          guarantee_days?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          niche?: string | null
          price?: number | null
          promise?: string | null
          tone_tags?: string[] | null
          whatsapp_url?: string | null
        }
        Update: {
          checkout_url?: string | null
          created_at?: string | null
          forbidden_words?: string[] | null
          guarantee_days?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          niche?: string | null
          price?: number | null
          promise?: string | null
          tone_tags?: string[] | null
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      script_usage_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          metadata: Json | null
          script_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          metadata?: Json | null
          script_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          metadata?: Json | null
          script_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_usage_events_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          body_block_id: string | null
          created_at: string | null
          cta_block_id: string | null
          duration_seconds: number
          final_text: string
          goal: string
          headline_block_id: string | null
          id: string
          is_favorite: boolean | null
          offer_block_id: string | null
          product_id: string | null
          ps_block_id: string | null
          status: string | null
          style: string
          user_id: string
        }
        Insert: {
          body_block_id?: string | null
          created_at?: string | null
          cta_block_id?: string | null
          duration_seconds: number
          final_text: string
          goal: string
          headline_block_id?: string | null
          id?: string
          is_favorite?: boolean | null
          offer_block_id?: string | null
          product_id?: string | null
          ps_block_id?: string | null
          status?: string | null
          style: string
          user_id: string
        }
        Update: {
          body_block_id?: string | null
          created_at?: string | null
          cta_block_id?: string | null
          duration_seconds?: number
          final_text?: string
          goal?: string
          headline_block_id?: string | null
          id?: string
          is_favorite?: boolean | null
          offer_block_id?: string | null
          product_id?: string | null
          ps_block_id?: string | null
          status?: string | null
          style?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripts_body_block_id_fkey"
            columns: ["body_block_id"]
            isOneToOne: false
            referencedRelation: "script_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_cta_block_id_fkey"
            columns: ["cta_block_id"]
            isOneToOne: false
            referencedRelation: "script_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_headline_block_id_fkey"
            columns: ["headline_block_id"]
            isOneToOne: false
            referencedRelation: "script_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_offer_block_id_fkey"
            columns: ["offer_block_id"]
            isOneToOne: false
            referencedRelation: "script_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "script_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_ps_block_id_fkey"
            columns: ["ps_block_id"]
            isOneToOne: false
            referencedRelation: "script_blocks"
            referencedColumns: ["id"]
          },
        ]
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
