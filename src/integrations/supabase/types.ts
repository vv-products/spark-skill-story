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
      avatars: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          position: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url: string
          position?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
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
      friend_codes: {
        Row: {
          code: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
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
      mission_crossword_variants: {
        Row: {
          cols: number
          created_at: string
          crossword_id: string
          difficulty: string
          id: string
          label: string
          rows: number
          updated_at: string
          xp_reward: number
        }
        Insert: {
          cols?: number
          created_at?: string
          crossword_id: string
          difficulty: string
          id?: string
          label: string
          rows?: number
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          cols?: number
          created_at?: string
          crossword_id?: string
          difficulty?: string
          id?: string
          label?: string
          rows?: number
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "mission_crossword_variants_crossword_id_fkey"
            columns: ["crossword_id"]
            isOneToOne: false
            referencedRelation: "mission_crosswords"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_crossword_words: {
        Row: {
          answer: string
          clue: string
          col: number
          created_at: string
          direction: string
          id: string
          number: number
          position: number
          row: number
          variant_id: string
        }
        Insert: {
          answer: string
          clue: string
          col: number
          created_at?: string
          direction: string
          id?: string
          number: number
          position?: number
          row: number
          variant_id: string
        }
        Update: {
          answer?: string
          clue?: string
          col?: number
          created_at?: string
          direction?: string
          id?: string
          number?: number
          position?: number
          row?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_crossword_words_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "mission_crossword_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_crosswords: {
        Row: {
          created_at: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_quiz_choices: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          label: string
          position: number
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          label: string
          position?: number
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          label?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_quiz_choices_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mission_quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_quiz_questions: {
        Row: {
          created_at: string
          explain: string | null
          id: string
          position: number
          prompt: string
          quiz_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explain?: string | null
          id?: string
          position?: number
          prompt: string
          quiz_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explain?: string | null
          id?: string
          position?: number
          prompt?: string
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "mission_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_quizzes: {
        Row: {
          base_xp: number
          created_at: string
          id: string
          pace: string
          per_right_xp: number
          slug: string
          time_limit_sec: number | null
          title: string
          updated_at: string
        }
        Insert: {
          base_xp?: number
          created_at?: string
          id?: string
          pace: string
          per_right_xp?: number
          slug: string
          time_limit_sec?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          base_xp?: number
          created_at?: string
          id?: string
          pace?: string
          per_right_xp?: number
          slug?: string
          time_limit_sec?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          avatar_id: string | null
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
          avatar_id?: string | null
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
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
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
      get_friend_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          age: number
          avatar_config: Json
          avatar_image_url: string
          bio: string
          display_name: string
          level: number
          stars: number
          total_xp: number
          user_id: string
        }[]
      }
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          age: number
          avatar_config: Json
          avatar_image_url: string
          bio: string
          display_name: string
          level: number
          stars: number
          total_xp: number
          user_id: string
        }[]
      }
      get_user_xp_breakdown: {
        Args: { _user_id: string }
        Returns: {
          events: number
          source: string
          total_xp: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_friend_code: {
        Args: { _code: string }
        Returns: {
          avatar_image_url: string
          display_name: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      friendship_status: "pending" | "accepted" | "declined"
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
      friendship_status: ["pending", "accepted", "declined"],
      layer_type: ["foundation", "quiz", "simulation", "reflection"],
      publish_status: ["draft", "published", "in_review"],
    },
  },
} as const
