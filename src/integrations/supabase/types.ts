export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      maintenance_requests: {
        Row: {
          actual_cost: number | null;
          additional_cost: number | null;
          additional_cost_description: string | null;
          agent_notes: string | null;
          assigned_worker_id: string | null;
          category: string;
          completed_at: string | null;
          completion_notes: string | null;
          created_at: string;
          description: string | null;
          estimated_cost: number | null;
          estimated_time: string | null;
          id: string;
          landlord_notes: string | null;
          photos: string[] | null;
          preferred_date: string | null;
          preferred_time_slots: string[] | null;
          priority: string;
          quick_fixes: string[] | null;
          quote_description: string | null;
          room: string | null;
          status: string;
          subcategory: string | null;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          actual_cost?: number | null;
          additional_cost?: number | null;
          additional_cost_description?: string | null;
          agent_notes?: string | null;
          assigned_worker_id?: string | null;
          category: string;
          completed_at?: string | null;
          completion_notes?: string | null;
          created_at?: string;
          description?: string | null;
          estimated_cost?: number | null;
          estimated_time?: string | null;
          id?: string;
          landlord_notes?: string | null;
          photos?: string[] | null;
          preferred_date?: string | null;
          preferred_time_slots?: string[] | null;
          priority?: string;
          quick_fixes?: string[] | null;
          quote_description?: string | null;
          room?: string | null;
          status?: string;
          subcategory?: string | null;
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          actual_cost?: number | null;
          additional_cost?: number | null;
          additional_cost_description?: string | null;
          agent_notes?: string | null;
          assigned_worker_id?: string | null;
          category?: string;
          completed_at?: string | null;
          completion_notes?: string | null;
          created_at?: string;
          description?: string | null;
          estimated_cost?: number | null;
          estimated_time?: string | null;
          id?: string;
          landlord_notes?: string | null;
          photos?: string[] | null;
          preferred_date?: string | null;
          preferred_time_slots?: string[] | null;
          priority?: string;
          quick_fixes?: string[] | null;
          quote_description?: string | null;
          room?: string | null;
          status?: string;
          subcategory?: string | null;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workers: {
        Row: {
          id: string;
          initials: string;
          name: string;
          specialty: string | null;
          rating: number | null;
          phone: string | null;
          description: string | null;
          favorite: boolean;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          initials: string;
          name: string;
          specialty?: string | null;
          rating?: number | null;
          phone?: string | null;
          description?: string | null;
          favorite?: boolean;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          initials?: string;
          name?: string;
          specialty?: string | null;
          rating?: number | null;
          phone?: string | null;
          description?: string | null;
          favorite?: boolean;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      worker_ratings: {
        Row: {
          id: string;
          worker_id: string;
          maintenance_request_id: string;
          rater_id: string;
          rater_type: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          maintenance_request_id: string;
          rater_id: string;
          rater_type: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          maintenance_request_id?: string;
          rater_id?: string;
          rater_type?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "worker_ratings_worker_id_fkey";
            columns: ["worker_id"];
            isOneToOne: false;
            referencedRelation: "workers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worker_ratings_maintenance_request_id_fkey";
            columns: ["maintenance_request_id"];
            isOneToOne: false;
            referencedRelation: "maintenance_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worker_ratings_rater_id_fkey";
            columns: ["rater_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          name: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          username: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: { user_id: string };
        Returns: Database["public"]["Enums"]["app_role"];
      };
    };
    Enums: {
      app_role: "tenant" | "agent" | "landlord";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["tenant", "agent", "landlord"],
    },
  },
} as const;
