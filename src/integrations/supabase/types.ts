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
      alerts: {
        Row: {
          case_id: string | null
          case_number: string | null
          created_at: string
          description: string | null
          employee_name: string | null
          event_date: string | null
          id: string
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          treated: boolean | null
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          case_id?: string | null
          case_number?: string | null
          created_at?: string
          description?: string | null
          employee_name?: string | null
          event_date?: string | null
          id?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
          treated?: boolean | null
          type: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          case_id?: string | null
          case_number?: string | null
          created_at?: string
          description?: string | null
          employee_name?: string | null
          event_date?: string | null
          id?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          treated?: boolean | null
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_checklists: {
        Row: {
          case_id: string
          created_at: string
          hearing_id: string | null
          id: string
          items: Json
          template_id: string | null
          template_name: string | null
          type: Database["public"]["Enums"]["checklist_type"]
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          hearing_id?: string | null
          id?: string
          items?: Json
          template_id?: string | null
          template_name?: string | null
          type: Database["public"]["Enums"]["checklist_type"]
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          hearing_id?: string | null
          id?: string
          items?: Json
          template_id?: string | null
          template_name?: string | null
          type?: Database["public"]["Enums"]["checklist_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_checklists_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_checklists_hearing_id_fkey"
            columns: ["hearing_id"]
            isOneToOne: false
            referencedRelation: "hearings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      case_fees: {
        Row: {
          amount: number
          case_id: string
          created_at: string
          description: string
          fee_type: Database["public"]["Enums"]["fee_type"]
          id: string
          installments: number | null
          paid_installments: number | null
          percentage: number | null
          updated_at: string
        }
        Insert: {
          amount?: number
          case_id: string
          created_at?: string
          description: string
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          installments?: number | null
          paid_installments?: number | null
          percentage?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string
          created_at?: string
          description?: string
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          installments?: number | null
          paid_installments?: number | null
          percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_fees_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_movements: {
        Row: {
          case_id: string
          court: string | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          movement_date: string
          source: string
          title: string
        }
        Insert: {
          case_id: string
          court?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          movement_date: string
          source?: string
          title: string
        }
        Update: {
          case_id?: string
          court?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          movement_date?: string
          source?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_movements_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_sync_log: {
        Row: {
          case_id: string
          id: string
          last_status: string | null
          last_synced_at: string
          movements_count: number | null
        }
        Insert: {
          case_id: string
          id?: string
          last_status?: string | null
          last_synced_at?: string
          movements_count?: number | null
        }
        Update: {
          case_id?: string
          id?: string
          last_status?: string | null
          last_synced_at?: string
          movements_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_sync_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          amount: number | null
          branch: string | null
          case_number: string
          company_id: string | null
          confidentiality: Database["public"]["Enums"]["confidentiality_level"]
          court: string | null
          created_at: string
          employee_id: string | null
          employee_name: string | null
          filed_at: string | null
          id: string
          lawyer: string | null
          next_deadline: string | null
          next_hearing: string | null
          reopened: boolean | null
          reopened_at: string | null
          reopened_reason: string | null
          responsible: string | null
          responsible_sector:
            | Database["public"]["Enums"]["responsible_sector"]
            | null
          status: Database["public"]["Enums"]["case_status"]
          theme: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          branch?: string | null
          case_number: string
          company_id?: string | null
          confidentiality?: Database["public"]["Enums"]["confidentiality_level"]
          court?: string | null
          created_at?: string
          employee_id?: string | null
          employee_name?: string | null
          filed_at?: string | null
          id?: string
          lawyer?: string | null
          next_deadline?: string | null
          next_hearing?: string | null
          reopened?: boolean | null
          reopened_at?: string | null
          reopened_reason?: string | null
          responsible?: string | null
          responsible_sector?:
            | Database["public"]["Enums"]["responsible_sector"]
            | null
          status?: Database["public"]["Enums"]["case_status"]
          theme?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          branch?: string | null
          case_number?: string
          company_id?: string | null
          confidentiality?: Database["public"]["Enums"]["confidentiality_level"]
          court?: string | null
          created_at?: string
          employee_id?: string | null
          employee_name?: string | null
          filed_at?: string | null
          id?: string
          lawyer?: string | null
          next_deadline?: string | null
          next_hearing?: string | null
          reopened?: boolean | null
          reopened_at?: string | null
          reopened_reason?: string | null
          responsible?: string | null
          responsible_sector?:
            | Database["public"]["Enums"]["responsible_sector"]
            | null
          status?: Database["public"]["Enums"]["case_status"]
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          created_at: string
          id: string
          items: Json
          name: string
          theme: string | null
          type: Database["public"]["Enums"]["checklist_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          name: string
          theme?: string | null
          type: Database["public"]["Enums"]["checklist_type"]
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          name?: string
          theme?: string | null
          type?: Database["public"]["Enums"]["checklist_type"]
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      deadline_suspensions: {
        Row: {
          case_id: string | null
          created_at: string
          deadline_id: string | null
          id: string
          reason: string
          remaining_days: number | null
          resumed_at: string | null
          suspended_at: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          deadline_id?: string | null
          id?: string
          reason: string
          remaining_days?: number | null
          resumed_at?: string | null
          suspended_at?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          deadline_id?: string | null
          id?: string
          reason?: string
          remaining_days?: number | null
          resumed_at?: string | null
          suspended_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadline_suspensions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadline_suspensions_deadline_id_fkey"
            columns: ["deadline_id"]
            isOneToOne: false
            referencedRelation: "deadlines"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          alert_15d: boolean | null
          alert_3d: boolean | null
          alert_7d: boolean | null
          alert_today: boolean | null
          business_days_count: number | null
          case_id: string
          court: string | null
          created_at: string
          deadline_type: string | null
          due_at: string
          id: string
          original_due_at: string | null
          status: Database["public"]["Enums"]["deadline_status"]
          suspended: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          alert_15d?: boolean | null
          alert_3d?: boolean | null
          alert_7d?: boolean | null
          alert_today?: boolean | null
          business_days_count?: number | null
          case_id: string
          court?: string | null
          created_at?: string
          deadline_type?: string | null
          due_at: string
          id?: string
          original_due_at?: string | null
          status?: Database["public"]["Enums"]["deadline_status"]
          suspended?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          alert_15d?: boolean | null
          alert_3d?: boolean | null
          alert_7d?: boolean | null
          alert_today?: boolean | null
          business_days_count?: number | null
          case_id?: string
          court?: string | null
          created_at?: string
          deadline_type?: string | null
          due_at?: string
          id?: string
          original_due_at?: string | null
          status?: Database["public"]["Enums"]["deadline_status"]
          suspended?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          variables: string[]
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          variables?: string[]
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          variables?: string[]
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          changed_by: string | null
          content: string
          created_at: string
          document_id: string
          id: string
          version: number
        }
        Insert: {
          changed_by?: string | null
          content?: string
          created_at?: string
          document_id: string
          id?: string
          version: number
        }
        Update: {
          changed_by?: string | null
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      download_logs: {
        Row: {
          downloaded_at: string | null
          evidence_item_id: string
          id: string
          user_name: string | null
          watermarked: boolean | null
        }
        Insert: {
          downloaded_at?: string | null
          evidence_item_id: string
          id?: string
          user_name?: string | null
          watermarked?: boolean | null
        }
        Update: {
          downloaded_at?: string | null
          evidence_item_id?: string
          id?: string
          user_name?: string | null
          watermarked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_evidence_item_id_fkey"
            columns: ["evidence_item_id"]
            isOneToOne: false
            referencedRelation: "evidence_items"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          case_id: string
          category: Database["public"]["Enums"]["evidence_category"]
          created_at: string
          fact_date: string | null
          file_size: string | null
          filename: string
          id: string
          origin: Database["public"]["Enums"]["evidence_origin"]
          request_id: string
          sha256: string | null
          status: Database["public"]["Enums"]["evidence_item_status"]
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          category?: Database["public"]["Enums"]["evidence_category"]
          created_at?: string
          fact_date?: string | null
          file_size?: string | null
          filename: string
          id?: string
          origin?: Database["public"]["Enums"]["evidence_origin"]
          request_id: string
          sha256?: string | null
          status?: Database["public"]["Enums"]["evidence_item_status"]
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          category?: Database["public"]["Enums"]["evidence_category"]
          created_at?: string
          fact_date?: string | null
          file_size?: string | null
          filename?: string
          id?: string
          origin?: Database["public"]["Enums"]["evidence_origin"]
          request_id?: string
          sha256?: string | null
          status?: Database["public"]["Enums"]["evidence_item_status"]
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "evidence_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_requests: {
        Row: {
          assigned_areas: string[] | null
          assigned_users: string[] | null
          case_id: string
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          sla_hours: number | null
          status: Database["public"]["Enums"]["evidence_request_status"]
          theme: string | null
        }
        Insert: {
          assigned_areas?: string[] | null
          assigned_users?: string[] | null
          case_id: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["evidence_request_status"]
          theme?: string | null
        }
        Update: {
          assigned_areas?: string[] | null
          assigned_users?: string[] | null
          case_id?: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["evidence_request_status"]
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          amount: number
          case_id: string
          category: string | null
          created_at: string
          description: string
          due_date: string | null
          entry_type: Database["public"]["Enums"]["financial_entry_type"]
          id: string
          paid_date: string | null
          status: Database["public"]["Enums"]["financial_entry_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          case_id: string
          category?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          entry_type: Database["public"]["Enums"]["financial_entry_type"]
          id?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string
          category?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          entry_type?: Database["public"]["Enums"]["financial_entry_type"]
          id?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          source: string
          template_id: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          case_id: string
          content?: string
          created_at?: string
          id?: string
          source?: string
          template_id?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          source?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      hearings: {
        Row: {
          case_id: string
          court: string | null
          created_at: string
          date: string
          id: string
          status: Database["public"]["Enums"]["hearing_status"]
          time: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          court?: string | null
          created_at?: string
          date: string
          id?: string
          status?: Database["public"]["Enums"]["hearing_status"]
          time?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          court?: string | null
          created_at?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["hearing_status"]
          time?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hearings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          court: string | null
          created_at: string
          date: string
          id: string
          name: string
          recurring: boolean
          scope: string
        }
        Insert: {
          court?: string | null
          created_at?: string
          date: string
          id?: string
          name: string
          recurring?: boolean
          scope?: string
        }
        Update: {
          court?: string | null
          created_at?: string
          date?: string
          id?: string
          name?: string
          recurring?: boolean
          scope?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      responsaveis: {
        Row: {
          active: boolean | null
          alerts_audiencias: boolean | null
          alerts_email: boolean | null
          alerts_prazos: boolean | null
          alerts_tarefas: boolean | null
          alerts_whatsapp: boolean | null
          company_id: string | null
          company_id_all: boolean | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string | null
        }
        Insert: {
          active?: boolean | null
          alerts_audiencias?: boolean | null
          alerts_email?: boolean | null
          alerts_prazos?: boolean | null
          alerts_tarefas?: boolean | null
          alerts_whatsapp?: boolean | null
          company_id?: string | null
          company_id_all?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          active?: boolean | null
          alerts_audiencias?: boolean | null
          alerts_email?: boolean | null
          alerts_prazos?: boolean | null
          alerts_tarefas?: boolean | null
          alerts_whatsapp?: boolean | null
          company_id?: string | null
          company_id_all?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responsaveis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          all_day: boolean | null
          assignees: string[] | null
          case_id: string | null
          created_at: string
          due_at: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          show_in_calendar: boolean | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          assignees?: string[] | null
          case_id?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          show_in_calendar?: boolean | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          assignees?: string[] | null
          case_id?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          show_in_calendar?: boolean | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          case_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["timeline_event_type"]
          user_name: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["timeline_event_type"]
          user_name?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["timeline_event_type"]
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          case_id: string
          created_at: string
          description: string
          hourly_rate: number | null
          hours: number
          id: string
          user_name: string
          work_date: string
        }
        Insert: {
          case_id: string
          created_at?: string
          description: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          user_name: string
          work_date?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          user_name?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
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
      can_access_case: {
        Args: { _case_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_company: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_all_company_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "atencao" | "urgente"
      alert_type:
        | "prazo"
        | "audiencia"
        | "tarefa"
        | "prova"
        | "publicacao"
        | "financeiro"
      app_role:
        | "admin"
        | "responsavel_juridico_interno"
        | "dp"
        | "rh"
        | "vendas"
        | "logistica"
        | "frota"
        | "advogado_externo"
      case_status:
        | "novo"
        | "em_andamento"
        | "audiencia_marcada"
        | "sentenca"
        | "recurso"
        | "encerrado"
      checklist_type: "pre_audiencia" | "pos_audiencia" | "provas_por_tema"
      confidentiality_level: "normal" | "restrito" | "ultra_restrito"
      deadline_status: "pendente" | "cumprido" | "vencido"
      evidence_category:
        | "ponto_eletronico"
        | "escalas"
        | "treinamento"
        | "conversas_oficiais"
        | "cftv_camera"
        | "documentos_assinados"
        | "emails"
        | "atestados_justificativas"
        | "epi_advertencias"
        | "catraca_controle_acesso"
        | "logs_servidor"
        | "logs_sistemas"
        | "outros"
      evidence_item_status: "pendente" | "recebido" | "validado" | "recusado"
      evidence_origin:
        | "email"
        | "whatsapp_corporativo"
        | "drive"
        | "sistema_ponto"
        | "sistema_catraca"
        | "servidor"
        | "outro"
      evidence_request_status:
        | "aberta"
        | "parcialmente_atendida"
        | "atendida"
        | "atrasada"
      fee_type: "fixo" | "exito" | "provisorio" | "ad_hoc"
      financial_entry_status: "pendente" | "pago" | "cancelado"
      financial_entry_type: "receita" | "despesa"
      hearing_status: "agendada" | "realizada" | "adiada" | "cancelada"
      priority_level: "baixa" | "media" | "alta" | "critica"
      responsible_sector: "dp" | "rh" | "frota" | "vendas" | "logistica" | "ti"
      task_status: "aberta" | "em_andamento" | "aguardando" | "concluida"
      timeline_event_type:
        | "processo_criado"
        | "status_alterado"
        | "prazo_criado"
        | "prazo_cumprido"
        | "audiencia_agendada"
        | "audiencia_realizada"
        | "prova_anexada"
        | "tarefa_criada"
        | "tarefa_concluida"
        | "comentario"
        | "checklist_aplicado"
        | "responsavel_alterado"
        | "campo_editado"
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
      alert_severity: ["info", "atencao", "urgente"],
      alert_type: [
        "prazo",
        "audiencia",
        "tarefa",
        "prova",
        "publicacao",
        "financeiro",
      ],
      app_role: [
        "admin",
        "responsavel_juridico_interno",
        "dp",
        "rh",
        "vendas",
        "logistica",
        "frota",
        "advogado_externo",
      ],
      case_status: [
        "novo",
        "em_andamento",
        "audiencia_marcada",
        "sentenca",
        "recurso",
        "encerrado",
      ],
      checklist_type: ["pre_audiencia", "pos_audiencia", "provas_por_tema"],
      confidentiality_level: ["normal", "restrito", "ultra_restrito"],
      deadline_status: ["pendente", "cumprido", "vencido"],
      evidence_category: [
        "ponto_eletronico",
        "escalas",
        "treinamento",
        "conversas_oficiais",
        "cftv_camera",
        "documentos_assinados",
        "emails",
        "atestados_justificativas",
        "epi_advertencias",
        "catraca_controle_acesso",
        "logs_servidor",
        "logs_sistemas",
        "outros",
      ],
      evidence_item_status: ["pendente", "recebido", "validado", "recusado"],
      evidence_origin: [
        "email",
        "whatsapp_corporativo",
        "drive",
        "sistema_ponto",
        "sistema_catraca",
        "servidor",
        "outro",
      ],
      evidence_request_status: [
        "aberta",
        "parcialmente_atendida",
        "atendida",
        "atrasada",
      ],
      fee_type: ["fixo", "exito", "provisorio", "ad_hoc"],
      financial_entry_status: ["pendente", "pago", "cancelado"],
      financial_entry_type: ["receita", "despesa"],
      hearing_status: ["agendada", "realizada", "adiada", "cancelada"],
      priority_level: ["baixa", "media", "alta", "critica"],
      responsible_sector: ["dp", "rh", "frota", "vendas", "logistica", "ti"],
      task_status: ["aberta", "em_andamento", "aguardando", "concluida"],
      timeline_event_type: [
        "processo_criado",
        "status_alterado",
        "prazo_criado",
        "prazo_cumprido",
        "audiencia_agendada",
        "audiencia_realizada",
        "prova_anexada",
        "tarefa_criada",
        "tarefa_concluida",
        "comentario",
        "checklist_aplicado",
        "responsavel_alterado",
        "campo_editado",
      ],
    },
  },
} as const
