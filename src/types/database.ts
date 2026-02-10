export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ai_responses: {
        Row: {
          completion_tokens: number | null;
          conversation_id: string | null;
          created_at: string | null;
          estimated_cost: number | null;
          id: string;
          latency_ms: number | null;
          message_id: string | null;
          metadata: Json | null;
          model: string;
          prompt: string;
          prompt_tokens: number | null;
          provider: string;
          quality_score: number | null;
          response: string;
          total_tokens: number | null;
          user_feedback: string | null;
        };
        Insert: {
          completion_tokens?: number | null;
          conversation_id?: string | null;
          created_at?: string | null;
          estimated_cost?: number | null;
          id?: string;
          latency_ms?: number | null;
          message_id?: string | null;
          metadata?: Json | null;
          model: string;
          prompt: string;
          prompt_tokens?: number | null;
          provider: string;
          quality_score?: number | null;
          response: string;
          total_tokens?: number | null;
          user_feedback?: string | null;
        };
        Update: {
          completion_tokens?: number | null;
          conversation_id?: string | null;
          created_at?: string | null;
          estimated_cost?: number | null;
          id?: string;
          latency_ms?: number | null;
          message_id?: string | null;
          metadata?: Json | null;
          model?: string;
          prompt?: string;
          prompt_tokens?: number | null;
          provider?: string;
          quality_score?: number | null;
          response?: string;
          total_tokens?: number | null;
          user_feedback?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_responses_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_responses_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          consultant_id: string | null;
          created_at: string | null;
          id: string;
          ip_address: unknown | null;
          metadata: Json | null;
          new_values: Json | null;
          old_values: Json | null;
          resource_id: string | null;
          resource_type: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          consultant_id?: string | null;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          metadata?: Json | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          consultant_id?: string | null;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          metadata?: Json | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_consultant_id_fkey';
            columns: ['consultant_id'];
            isOneToOne: false;
            referencedRelation: 'consultants';
            referencedColumns: ['id'];
          },
        ];
      };
      consultants: {
        Row: {
          created_at: string | null;
          credits: number;
          credits_reset_at: string | null;
          date_paid: string | null;
          email: string;
          id: string;
          is_admin: boolean;
          last_login_at: string | null;
          leads_count_current_month: number | null;
          meta_access_token: string | null;
          meta_refresh_token: string | null;
          monthly_credits_allocation: number;
          monthly_lead_limit: number | null;
          name: string;
          purchased_credits: number;
          settings: Json | null;
          slug: string;
          stripe_customer_id: string | null;
          subscription_expires_at: string | null;
          subscription_plan: string | null;
          subscription_status: string | null;
          subscription_tier: string | null;
          updated_at: string | null;
          user_id: string | null;
          vertical: Database['public']['Enums']['vertical_type'] | null;
          whatsapp_business_account_id: string | null;
          whatsapp_number: string | null;
          whatsapp_phone_number_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits?: number;
          credits_reset_at?: string | null;
          date_paid?: string | null;
          email: string;
          id?: string;
          is_admin?: boolean;
          last_login_at?: string | null;
          leads_count_current_month?: number | null;
          meta_access_token?: string | null;
          meta_refresh_token?: string | null;
          monthly_credits_allocation?: number;
          monthly_lead_limit?: number | null;
          name: string;
          purchased_credits?: number;
          settings?: Json | null;
          slug: string;
          stripe_customer_id?: string | null;
          subscription_expires_at?: string | null;
          subscription_plan?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          vertical?: Database['public']['Enums']['vertical_type'] | null;
          whatsapp_business_account_id?: string | null;
          whatsapp_number?: string | null;
          whatsapp_phone_number_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits?: number;
          credits_reset_at?: string | null;
          date_paid?: string | null;
          email?: string;
          id?: string;
          is_admin?: boolean;
          last_login_at?: string | null;
          leads_count_current_month?: number | null;
          meta_access_token?: string | null;
          meta_refresh_token?: string | null;
          monthly_credits_allocation?: number;
          monthly_lead_limit?: number | null;
          name?: string;
          purchased_credits?: number;
          settings?: Json | null;
          slug?: string;
          stripe_customer_id?: string | null;
          subscription_expires_at?: string | null;
          subscription_plan?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          vertical?: Database['public']['Enums']['vertical_type'] | null;
          whatsapp_business_account_id?: string | null;
          whatsapp_number?: string | null;
          whatsapp_phone_number_id?: string | null;
        };
        Relationships: [];
      };
      contact_form_messages: {
        Row: {
          content: string;
          consultant_id: string;
          created_at: string;
          id: string;
          is_read: boolean;
          replied_at: string | null;
        };
        Insert: {
          content: string;
          consultant_id: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          replied_at?: string | null;
        };
        Update: {
          content?: string;
          consultant_id?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          replied_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'contact_form_messages_consultant_id_fkey';
            columns: ['consultant_id'];
            isOneToOne: false;
            referencedRelation: 'consultants';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_stats: {
        Row: {
          date: string;
          id: string;
          paid_user_count: number;
          paid_user_delta: number;
          profit: number;
          total_revenue: number;
          total_views: number;
          user_count: number;
          user_delta: number;
        };
        Insert: {
          date: string;
          id?: string;
          paid_user_count?: number;
          paid_user_delta?: number;
          profit?: number;
          total_revenue?: number;
          total_views?: number;
          user_count?: number;
          user_delta?: number;
        };
        Update: {
          date?: string;
          id?: string;
          paid_user_count?: number;
          paid_user_delta?: number;
          profit?: number;
          total_revenue?: number;
          total_views?: number;
          user_count?: number;
          user_delta?: number;
        };
        Relationships: [];
      };
      files: {
        Row: {
          consultant_id: string;
          created_at: string;
          id: string;
          name: string;
          size_bytes: number;
          storage_key: string;
          type: string;
        };
        Insert: {
          consultant_id: string;
          created_at?: string;
          id?: string;
          name: string;
          size_bytes: number;
          storage_key: string;
          type: string;
        };
        Update: {
          consultant_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          size_bytes?: number;
          storage_key?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'files_consultant_id_fkey';
            columns: ['consultant_id'];
            isOneToOne: false;
            referencedRelation: 'consultants';
            referencedColumns: ['id'];
          },
        ];
      };
      whatsapp_integrations: {
        Row: {
          id: string;
          consultant_id: string;
          provider: 'meta' | 'weni' | '360dialog' | 'twilio';
          access_token: string | null;
          refresh_token: string | null;
          api_key: string | null;
          api_secret: string | null;
          webhook_secret: string | null;
          phone_number: string;
          phone_number_id: string | null;
          waba_id: string | null;
          display_name: string | null;
          status: 'active' | 'inactive' | 'suspended' | 'expired';
          verified_at: string | null;
          expires_at: string | null;
          last_sync_at: string | null;
          webhook_url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          consultant_id: string;
          provider: 'meta' | 'weni' | '360dialog' | 'twilio';
          access_token?: string | null;
          refresh_token?: string | null;
          api_key?: string | null;
          api_secret?: string | null;
          webhook_secret?: string | null;
          phone_number: string;
          phone_number_id?: string | null;
          waba_id?: string | null;
          display_name?: string | null;
          status?: 'active' | 'inactive' | 'suspended' | 'expired';
          verified_at?: string | null;
          expires_at?: string | null;
          last_sync_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultant_id?: string;
          provider?: 'meta' | 'weni' | '360dialog' | 'twilio';
          access_token?: string | null;
          refresh_token?: string | null;
          api_key?: string | null;
          api_secret?: string | null;
          webhook_secret?: string | null;
          phone_number?: string;
          phone_number_id?: string | null;
          waba_id?: string | null;
          display_name?: string | null;
          status?: 'active' | 'inactive' | 'suspended' | 'expired';
          verified_at?: string | null;
          expires_at?: string | null;
          last_sync_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'whatsapp_integrations_consultant_id_fkey';
            columns: ['consultant_id'];
            isOneToOne: false;
            referencedRelation: 'consultants';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          completed_at: string | null;
          completion_percentage: number | null;
          created_at: string | null;
          current_step_id: string | null;
          flow_id: string | null;
          id: string;
          last_message_at: string | null;
          lead_id: string;
          message_count: number | null;
          started_at: string | null;
          state: Json | null;
          status: Database['public']['Enums']['conversation_status'] | null;
          updated_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          current_step_id?: string | null;
          flow_id?: string | null;
          id?: string;
          last_message_at?: string | null;
          lead_id: string;
          message_count?: number | null;
          started_at?: string | null;
          state?: Json | null;
          status?: Database['public']['Enums']['conversation_status'] | null;
          updated_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          current_step_id?: string | null;
          flow_id?: string | null;
          id?: string;
          last_message_at?: string | null;
          lead_id?: string;
          message_count?: number | null;
          started_at?: string | null;
          state?: Json | null;
          status?: Database['public']['Enums']['conversation_status'] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_flow_id_fkey';
            columns: ['flow_id'];
            isOneToOne: false;
            referencedRelation: 'flows';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
        ];
      };
      flows: {
        Row: {
          completion_rate: number | null;
          consultant_id: string | null;
          created_at: string | null;
          definition: Json;
          description: string | null;
          id: string;
          is_active: boolean | null;
          is_default: boolean | null;
          name: string;
          published_at: string | null;
          updated_at: string | null;
          usage_count: number | null;
          version: string | null;
          vertical: Database['public']['Enums']['vertical_type'];
        };
        Insert: {
          completion_rate?: number | null;
          consultant_id?: string | null;
          created_at?: string | null;
          definition: Json;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          name: string;
          published_at?: string | null;
          updated_at?: string | null;
          usage_count?: number | null;
          version?: string | null;
          vertical: Database['public']['Enums']['vertical_type'];
        };
        Update: {
          completion_rate?: number | null;
          consultant_id?: string | null;
          created_at?: string | null;
          definition?: Json;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          name?: string;
          published_at?: string | null;
          updated_at?: string | null;
          usage_count?: number | null;
          version?: string | null;
          vertical?: Database['public']['Enums']['vertical_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'flows_consultant_id_fkey';
            columns: ['consultant_id'];
            isOneToOne: false;
            referencedRelation: 'consultants';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          consultant_id: string;
          created_at: string | null;
          email: string | null;
          id: string;
          last_contacted_at: string | null;
          metadata: Json | null;
          name: string | null;
          qualified_at: string | null;
          score: number | null;
          source: string | null;
          status: Database['public']['Enums']['lead_status'] | null;
          updated_at: string | null;
          utm_campaign: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          whatsapp_number: string;
        };
        Insert: {
          consultant_id: string;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_contacted_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          qualified_at?: string | null;
          score?: number | null;
          source?: string | null;
          status?: Database['public']['Enums']['lead_status'] | null;
          updated_at?: string | null;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          whatsapp_number: string;
        };
        Update: {
          consultant_id?: string;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_contacted_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          qualified_at?: string | null;
          score?: number | null;
          source?: string | null;
          status?: Database['public']['Enums']['lead_status'] | null;
          updated_at?: string | null;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          whatsapp_number?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_consultant_id_fkey';
            columns: ['consultant_id'];
            isOneToOne: false;
            referencedRelation: 'consultants';
            referencedColumns: ['id'];
          },
        ];
      };
      logs: {
        Row: {
          created_at: string;
          id: number;
          level: string;
          message: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          level?: string;
          message: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          level?: string;
          message?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          ai_completion_tokens: number | null;
          ai_model: string | null;
          ai_prompt_tokens: number | null;
          content: string;
          content_type: string | null;
          conversation_id: string;
          created_at: string | null;
          delivered_at: string | null;
          direction: Database['public']['Enums']['message_direction'];
          error_message: string | null;
          id: string;
          is_ai_generated: boolean | null;
          metadata: Json | null;
          read_at: string | null;
          retry_count: number | null;
          sent_at: string | null;
          status: Database['public']['Enums']['message_status'] | null;
          whatsapp_message_id: string | null;
          whatsapp_timestamp: string | null;
        };
        Insert: {
          ai_completion_tokens?: number | null;
          ai_model?: string | null;
          ai_prompt_tokens?: number | null;
          content: string;
          content_type?: string | null;
          conversation_id: string;
          created_at?: string | null;
          delivered_at?: string | null;
          direction: Database['public']['Enums']['message_direction'];
          error_message?: string | null;
          id?: string;
          is_ai_generated?: boolean | null;
          metadata?: Json | null;
          read_at?: string | null;
          retry_count?: number | null;
          sent_at?: string | null;
          status?: Database['public']['Enums']['message_status'] | null;
          whatsapp_message_id?: string | null;
          whatsapp_timestamp?: string | null;
        };
        Update: {
          ai_completion_tokens?: number | null;
          ai_model?: string | null;
          ai_prompt_tokens?: number | null;
          content?: string;
          content_type?: string | null;
          conversation_id?: string;
          created_at?: string | null;
          delivered_at?: string | null;
          direction?: Database['public']['Enums']['message_direction'];
          error_message?: string | null;
          id?: string;
          is_ai_generated?: boolean | null;
          metadata?: Json | null;
          read_at?: string | null;
          retry_count?: number | null;
          sent_at?: string | null;
          status?: Database['public']['Enums']['message_status'] | null;
          whatsapp_message_id?: string | null;
          whatsapp_timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      page_view_sources: {
        Row: {
          date: string;
          name: string;
          visitors: number;
        };
        Insert: {
          date: string;
          name: string;
          visitors?: number;
        };
        Update: {
          date?: string;
          name?: string;
          visitors?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'page_view_sources_date_fkey';
            columns: ['date'];
            isOneToOne: false;
            referencedRelation: 'daily_stats';
            referencedColumns: ['date'];
          },
        ];
      };
      webhook_events: {
        Row: {
          created_at: string | null;
          error_message: string | null;
          event_type: string;
          id: string;
          processed_at: string | null;
          processing_time_ms: number | null;
          provider: string;
          request_body: Json | null;
          request_headers: Json | null;
          response_body: Json | null;
          response_status: number | null;
        };
        Insert: {
          created_at?: string | null;
          error_message?: string | null;
          event_type: string;
          id?: string;
          processed_at?: string | null;
          processing_time_ms?: number | null;
          provider: string;
          request_body?: Json | null;
          request_headers?: Json | null;
          response_body?: Json | null;
          response_status?: number | null;
        };
        Update: {
          created_at?: string | null;
          error_message?: string | null;
          event_type?: string;
          id?: string;
          processed_at?: string | null;
          processing_time_ms?: number | null;
          provider?: string;
          request_body?: Json | null;
          request_headers?: Json | null;
          response_body?: Json | null;
          response_status?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_daily_stats: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      current_consultant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      decrement_credits: {
        Args: {
          user_id: string;
          amount: number;
        };
        Returns: number;
      };
      is_consultant_owner: {
        Args: {
          check_consultant_id: string;
        };
        Returns: boolean;
      };
      reset_monthly_credits: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      conversation_status: 'active' | 'completed' | 'abandoned' | 'paused';
      lead_status: 'novo' | 'em_contato' | 'qualificado' | 'agendado' | 'fechado' | 'perdido';
      message_direction: 'inbound' | 'outbound';
      message_status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
      vertical_type: 'saude' | 'imoveis';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
        };
        Returns: {
          key: string;
          id: string;
          created_at: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          start_after?: string;
          next_token?: string;
        };
        Returns: {
          name: string;
          id: string;
          metadata: Json;
          updated_at: string;
        }[];
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
