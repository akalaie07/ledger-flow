export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          stripe_account_id: string | null;
          stripe_connected_at: string | null;
          legal_name: string | null;
          address_street: string | null;
          address_zip: string | null;
          address_city: string | null;
          address_country: string;
          contact_email: string | null;
          vat_id: string | null;
          avv_accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          stripe_account_id?: string | null;
          stripe_connected_at?: string | null;
          legal_name?: string | null;
          address_street?: string | null;
          address_zip?: string | null;
          address_city?: string | null;
          address_country?: string;
          contact_email?: string | null;
          vat_id?: string | null;
          avv_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          stripe_account_id?: string | null;
          stripe_connected_at?: string | null;
          legal_name?: string | null;
          address_street?: string | null;
          address_zip?: string | null;
          address_city?: string | null;
          address_country?: string;
          contact_email?: string | null;
          vat_id?: string | null;
          avv_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          price_amount: number;
          payment_type: Database["public"]["Enums"]["payment_type_enum"];
          down_payment: number | null;
          installment_count: number | null;
          installment_interval_days: number | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          price_amount: number;
          payment_type?: Database["public"]["Enums"]["payment_type_enum"];
          down_payment?: number | null;
          installment_count?: number | null;
          installment_interval_days?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          price_amount?: number;
          payment_type?: Database["public"]["Enums"]["payment_type_enum"];
          down_payment?: number | null;
          installment_count?: number | null;
          installment_interval_days?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          name: string;
          phone: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          name: string;
          phone?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          product_id: string | null;
          total_price: number;
          payment_type: Database["public"]["Enums"]["payment_type_enum"];
          down_payment: number | null;
          stripe_checkout_session_id: string | null;
          refunded: boolean;
          cancelled: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          customer_id: string;
          product_id?: string | null;
          total_price: number;
          payment_type: Database["public"]["Enums"]["payment_type_enum"];
          down_payment?: number | null;
          stripe_checkout_session_id?: string | null;
          refunded?: boolean;
          cancelled?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          customer_id?: string;
          product_id?: string | null;
          total_price?: number;
          payment_type?: Database["public"]["Enums"]["payment_type_enum"];
          down_payment?: number | null;
          stripe_checkout_session_id?: string | null;
          refunded?: boolean;
          cancelled?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      installments: {
        Row: {
          id: string;
          organization_id: string;
          deal_id: string;
          sequence: number;
          due_date: string;
          amount: number;
          paid: boolean;
          paid_at: string | null;
          stripe_payment_intent_id: string | null;
          failed_attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          deal_id: string;
          sequence: number;
          due_date: string;
          amount: number;
          paid?: boolean;
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          failed_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          deal_id?: string;
          sequence?: number;
          due_date?: string;
          amount?: number;
          paid?: boolean;
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          failed_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "installments_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          id: string;
          organization_id: string | null;
          stripe_event_id: string;
          event_type: string;
          payload: Json;
          processed_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          stripe_event_id: string;
          event_type: string;
          payload: Json;
          processed_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          stripe_event_id?: string;
          event_type?: string;
          payload?: Json;
          processed_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webhook_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      deal_balance: {
        Row: {
          deal_id: string;
          organization_id: string;
          paid_sum: number;
          open_sum: number;
          overdue_sum: number;
          has_overdue: boolean;
        };
        Relationships: [];
      };
      deals_with_status: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          product_id: string | null;
          total_price: number;
          payment_type: Database["public"]["Enums"]["payment_type_enum"];
          down_payment: number | null;
          stripe_checkout_session_id: string | null;
          refunded: boolean;
          cancelled: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
          paid_sum: number;
          open_sum: number;
          overdue_sum: number;
          has_overdue: boolean;
          computed_status: "open" | "paid" | "overdue" | "refunded" | "cancelled";
        };
        Relationships: [];
      };
    };
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: {
      payment_type_enum: "one_time" | "installments";
    };
    CompositeTypes: Record<string, unknown>;
  };
};
