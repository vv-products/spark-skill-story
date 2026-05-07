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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      class_progress: {
        Row: {
          class_id: string
          completed_at: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          class_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          class_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          estimated_minutes: number | null
          hero_image_url: string | null
          id: string
          module_id: string
          position: number
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number | null
          hero_image_url?: string | null
          id?: string
          module_id: string
          position?: number
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number | null
          hero_image_url?: string | null
          id?: string
          module_id?: string
          position?: number
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      layers: {
        Row: {
          class_id: string
          config: Json
          created_at: string
          id: string
          position: number
          title: string
          type: Database["public"]["Enums"]["layer_type"]
          updated_at: string
          xp_reward: number
        }
        Insert: {
          class_id: string
          config?: Json
          created_at?: string
          id?: string
          position?: number
          title: string
          type: Database["public"]["Enums"]["layer_type"]
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          class_id?: string
          config?: Json
          created_at?: string
          id?: string
          position?: number
          title?: string
          type?: Database["public"]["Enums"]["layer_type"]
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "layers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          position: number
          slug: string
          subtitle: string | null
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          slug: string
          subtitle?: string | null
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          slug?: string
          subtitle?: string | null
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      pillars: {
        Row: {
          created_at: string
          emoji: string | null
          id: string
          position: number
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: string
          position?: number
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: string
          position?: number
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_config: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_config?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_config?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          age_groups: string[]
          created_at: string
          id: string
          pillar_id: string
          position: number
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          age_groups?: string[]
          created_at?: string
          id?: string
          pillar_id: string
          position?: number
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          age_groups?: string[]
          created_at?: string
          id?: string
          pillar_id?: string
          position?: number
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "pillars"
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
      welcome_cards: {
        Row: {
          active: boolean
          created_at: string
          cta_destination: string
          cta_label: string
          headline: string
          hero_image_url: string | null
          id: string
          position: number
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_destination?: string
          cta_label?: string
          headline: string
          hero_image_url?: string | null
          id?: string
          position?: number
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_destination?: string
          cta_label?: string
          headline?: string
          hero_image_url?: string | null
          id?: string
          position?: number
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          class_id: string | null
          created_at: string
          id: string
          layer_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          class_id?: string | null
          created_at?: string
          id?: string
          layer_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          class_id?: string | null
          created_at?: string
          id?: string
          layer_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_layer_id_fkey"
            columns: ["layer_id"]
            isOneToOne: false
            referencedRelation: "layers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          age: number
          avatar_config: Json
          bio: string
          display_name: string
          total_xp: number
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      layer_type: "foundation" | "quiz" | "simulation" | "reflection"
      publish_status: "draft" | "published" | "in_review"
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
      app_role: ["admin", "editor"],
      layer_type: ["foundation", "quiz", "simulation", "reflection"],
      publish_status: ["draft", "published", "in_review"],
    },
  },
} as const
