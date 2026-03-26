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
      bank_accounts: {
        Row: {
          account_key: string
          bank_name: string
          bic: string
          created_at: string | null
          holder: string
          iban: string
          id: string
          is_active: boolean | null
          name: string
          threshold_max: number | null
          threshold_min: number | null
          updated_at: string | null
        }
        Insert: {
          account_key: string
          bank_name: string
          bic: string
          created_at?: string | null
          holder?: string
          iban: string
          id?: string
          is_active?: boolean | null
          name: string
          threshold_max?: number | null
          threshold_min?: number | null
          updated_at?: string | null
        }
        Update: {
          account_key?: string
          bank_name?: string
          bic?: string
          created_at?: string | null
          holder?: string
          iban?: string
          id?: string
          is_active?: boolean | null
          name?: string
          threshold_max?: number | null
          threshold_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_center_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_price: number
          product_title: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_price: number
          product_title: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_price?: number
          product_title?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          language: string | null
          notes: string | null
          payment_receipt_url: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_cost: number | null
          shipping_cost_notified: boolean | null
          shipping_country: string | null
          shipping_email: string | null
          shipping_name: string | null
          shipping_phone: string | null
          shipping_postal_code: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          notes?: string | null
          payment_receipt_url?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_cost_notified?: boolean | null
          shipping_country?: string | null
          shipping_email?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          notes?: string | null
          payment_receipt_url?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_cost_notified?: boolean | null
          shipping_country?: string | null
          shipping_email?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paypal_settings: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          is_active: boolean
          sandbox_mode: boolean
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          sandbox_mode?: boolean
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          sandbox_mode?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          bestseller_rank: number | null
          brand: string | null
          category: string
          condition: string | null
          created_at: string
          created_by: string | null
          customer_images: string[] | null
          department: string | null
          description: string | null
          description_translations: Json | null
          discount_percentage: number | null
          featured: boolean | null
          hours: number | null
          id: string
          images: string[] | null
          kilometers: number | null
          location: string | null
          low_stock_threshold: number | null
          merchant_safe_additional_images: string[] | null
          merchant_safe_image_url: string | null
          model: string | null
          original_price: number | null
          price: number
          price_type: string | null
          reference_number: number
          seller_email: string | null
          seller_name: string | null
          seller_phone: string | null
          status: string | null
          stock: number | null
          subcategory: string | null
          title: string
          title_translations: Json | null
          updated_at: string
          year: number | null
        }
        Insert: {
          bestseller_rank?: number | null
          brand?: string | null
          category: string
          condition?: string | null
          created_at?: string
          created_by?: string | null
          customer_images?: string[] | null
          department?: string | null
          description?: string | null
          description_translations?: Json | null
          discount_percentage?: number | null
          featured?: boolean | null
          hours?: number | null
          id?: string
          images?: string[] | null
          kilometers?: number | null
          location?: string | null
          low_stock_threshold?: number | null
          merchant_safe_additional_images?: string[] | null
          merchant_safe_image_url?: string | null
          model?: string | null
          original_price?: number | null
          price: number
          price_type?: string | null
          reference_number?: number
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          status?: string | null
          stock?: number | null
          subcategory?: string | null
          title: string
          title_translations?: Json | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          bestseller_rank?: number | null
          brand?: string | null
          category?: string
          condition?: string | null
          created_at?: string
          created_by?: string | null
          customer_images?: string[] | null
          department?: string | null
          description?: string | null
          description_translations?: Json | null
          discount_percentage?: number | null
          featured?: boolean | null
          hours?: number | null
          id?: string
          images?: string[] | null
          kilometers?: number | null
          location?: string | null
          low_stock_threshold?: number | null
          merchant_safe_additional_images?: string[] | null
          merchant_safe_image_url?: string | null
          model?: string | null
          original_price?: number | null
          price?: number
          price_type?: string | null
          reference_number?: number
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          status?: string | null
          stock?: number | null
          subcategory?: string | null
          title?: string
          title_translations?: Json | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          postal_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applies_to: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          max_price: number | null
          min_price: number | null
          name: string
          priority: number
          start_date: string
          target_categories: string[] | null
          target_product_ids: string[] | null
          updated_at: string
        }
        Insert: {
          applies_to?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean
          max_price?: number | null
          min_price?: number | null
          name: string
          priority?: number
          start_date: string
          target_categories?: string[] | null
          target_product_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          applies_to?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          max_price?: number | null
          min_price?: number | null
          name?: string
          priority?: number
          start_date?: string
          target_categories?: string[] | null
          target_product_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          countries: string[]
          created_at: string
          id: string
          is_active: boolean
          max_days: number
          min_days: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          countries?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          max_days?: number
          min_days?: number
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          countries?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          max_days?: number
          min_days?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_avatar_url: string | null
          author_company: string | null
          author_location: string | null
          author_name: string
          content: string
          content_translations: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_company?: string | null
          author_location?: string | null
          author_name: string
          content: string
          content_translations?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          author_avatar_url?: string | null
          author_company?: string | null
          author_location?: string | null
          author_name?: string
          content?: string
          content_translations?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
          updated_at?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      products_public: {
        Row: {
          bestseller_rank: number | null
          brand: string | null
          category: string | null
          condition: string | null
          created_at: string | null
          created_by: string | null
          customer_images: string[] | null
          department: string | null
          description: string | null
          description_translations: Json | null
          discount_percentage: number | null
          featured: boolean | null
          hours: number | null
          id: string | null
          images: string[] | null
          kilometers: number | null
          location: string | null
          low_stock_threshold: number | null
          merchant_safe_additional_images: string[] | null
          merchant_safe_image_url: string | null
          model: string | null
          original_price: number | null
          price: number | null
          price_type: string | null
          reference_number: number | null
          seller_name: string | null
          status: string | null
          stock: number | null
          subcategory: string | null
          title: string | null
          title_translations: Json | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          bestseller_rank?: number | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_images?: string[] | null
          department?: string | null
          description?: string | null
          description_translations?: Json | null
          discount_percentage?: number | null
          featured?: boolean | null
          hours?: number | null
          id?: string | null
          images?: string[] | null
          kilometers?: number | null
          location?: string | null
          low_stock_threshold?: number | null
          merchant_safe_additional_images?: string[] | null
          merchant_safe_image_url?: string | null
          model?: string | null
          original_price?: number | null
          price?: number | null
          price_type?: string | null
          reference_number?: number | null
          seller_name?: string | null
          status?: string | null
          stock?: number | null
          subcategory?: string | null
          title?: string | null
          title_translations?: Json | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          bestseller_rank?: number | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_images?: string[] | null
          department?: string | null
          description?: string | null
          description_translations?: Json | null
          discount_percentage?: number | null
          featured?: boolean | null
          hours?: number | null
          id?: string | null
          images?: string[] | null
          kilometers?: number | null
          location?: string | null
          low_stock_threshold?: number | null
          merchant_safe_additional_images?: string[] | null
          merchant_safe_image_url?: string | null
          model?: string | null
          original_price?: number | null
          price?: number | null
          price_type?: string | null
          reference_number?: number | null
          seller_name?: string | null
          status?: string | null
          stock?: number | null
          subcategory?: string | null
          title?: string | null
          title_translations?: Json | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_bank_account_for_amount: {
        Args: { order_amount: number }
        Returns: {
          account_key: string
          bank_name: string
          bic: string
          holder: string
          iban: string
          id: string
          name: string
          threshold_max: number
          threshold_min: number
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
