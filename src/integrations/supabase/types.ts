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
      admin_settings: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      course_audit_log: {
        Row: {
          action: string
          changed_fields: Json | null
          course_id: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: Json | null
          course_id: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          about_course: string | null
          access_items: Json | null
          banner_image_url: string | null
          category: string
          certification: string | null
          created_at: string
          description: string | null
          duration_range: string | null
          faq: Json | null
          hours: number | null
          how_it_works: string[] | null
          id: string
          image_url: string | null
          installment: string | null
          is_active: boolean
          market: string | null
          methodology_materials: string[] | null
          methodology_response_time: string | null
          methodology_services: string[] | null
          modules: Json | null
          original_price: string | null
          profession: string | null
          promo_price: string | null
          rating: number | null
          registration_approved_date: string | null
          registration_parecer: string | null
          registration_portaria: string | null
          registration_register_with: string | null
          requirements: string[] | null
          slug: string
          subtitle: string | null
          title: string
          tutor_attributes: string[] | null
          tutoring: string | null
          updated_at: string
          youtube_video_id: string | null
        }
        Insert: {
          about_course?: string | null
          access_items?: Json | null
          banner_image_url?: string | null
          category?: string
          certification?: string | null
          created_at?: string
          description?: string | null
          duration_range?: string | null
          faq?: Json | null
          hours?: number | null
          how_it_works?: string[] | null
          id?: string
          image_url?: string | null
          installment?: string | null
          is_active?: boolean
          market?: string | null
          methodology_materials?: string[] | null
          methodology_response_time?: string | null
          methodology_services?: string[] | null
          modules?: Json | null
          original_price?: string | null
          profession?: string | null
          promo_price?: string | null
          rating?: number | null
          registration_approved_date?: string | null
          registration_parecer?: string | null
          registration_portaria?: string | null
          registration_register_with?: string | null
          requirements?: string[] | null
          slug: string
          subtitle?: string | null
          title: string
          tutor_attributes?: string[] | null
          tutoring?: string | null
          updated_at?: string
          youtube_video_id?: string | null
        }
        Update: {
          about_course?: string | null
          access_items?: Json | null
          banner_image_url?: string | null
          category?: string
          certification?: string | null
          created_at?: string
          description?: string | null
          duration_range?: string | null
          faq?: Json | null
          hours?: number | null
          how_it_works?: string[] | null
          id?: string
          image_url?: string | null
          installment?: string | null
          is_active?: boolean
          market?: string | null
          methodology_materials?: string[] | null
          methodology_response_time?: string | null
          methodology_services?: string[] | null
          modules?: Json | null
          original_price?: string | null
          profession?: string | null
          promo_price?: string | null
          rating?: number | null
          registration_approved_date?: string | null
          registration_parecer?: string | null
          registration_portaria?: string | null
          registration_register_with?: string | null
          requirements?: string[] | null
          slug?: string
          subtitle?: string | null
          title?: string
          tutor_attributes?: string[] | null
          tutoring?: string | null
          updated_at?: string
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      promotional_themes: {
        Row: {
          banner_bottom_text: string | null
          banner_cta_emoji: string | null
          banner_cta_text: string | null
          banner_emoji: string | null
          banner_subtitle: string | null
          banner_title: string | null
          coupon_code: string | null
          created_at: string
          discount_percentage: number
          exit_popup_subtitle: string | null
          exit_popup_title: string | null
          id: string
          is_active: boolean
          name: string
          scheduled_months: number[] | null
          slug: string
          theme_style: string
          updated_at: string
        }
        Insert: {
          banner_bottom_text?: string | null
          banner_cta_emoji?: string | null
          banner_cta_text?: string | null
          banner_emoji?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_percentage?: number
          exit_popup_subtitle?: string | null
          exit_popup_title?: string | null
          id?: string
          is_active?: boolean
          name: string
          scheduled_months?: number[] | null
          slug: string
          theme_style?: string
          updated_at?: string
        }
        Update: {
          banner_bottom_text?: string | null
          banner_cta_emoji?: string | null
          banner_cta_text?: string | null
          banner_emoji?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_percentage?: number
          exit_popup_subtitle?: string | null
          exit_popup_title?: string | null
          id?: string
          is_active?: boolean
          name?: string
          scheduled_months?: number[] | null
          slug?: string
          theme_style?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_email_by_username: { Args: { _username: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
