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
      announcements: {
        Row: {
          archived: boolean
          attachment_url: string | null
          audience: string
          category: string
          course_id: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          message: string
          priority: string
          publish_at: string | null
          published: boolean
          starts_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          attachment_url?: string | null
          audience?: string
          category?: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          message: string
          priority?: string
          publish_at?: string | null
          published?: boolean
          starts_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          attachment_url?: string | null
          audience?: string
          category?: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          message?: string
          priority?: string
          publish_at?: string | null
          published?: boolean
          starts_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          county: string | null
          course_id: string | null
          course_name: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          highest_qualification: string | null
          id: string
          intake: string | null
          interview_at: string | null
          interview_location: string | null
          interview_notes: string | null
          interview_score: number | null
          mean_grade: string | null
          national_id: string | null
          notes: string | null
          phone: string
          previous_school: string | null
          reference: string
          reviewed_at: string | null
          reviewed_by: string | null
          staff_notes: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          county?: string | null
          course_id?: string | null
          course_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          highest_qualification?: string | null
          id?: string
          intake?: string | null
          interview_at?: string | null
          interview_location?: string | null
          interview_notes?: string | null
          interview_score?: number | null
          mean_grade?: string | null
          national_id?: string | null
          notes?: string | null
          phone: string
          previous_school?: string | null
          reference?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          staff_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          county?: string | null
          course_id?: string | null
          course_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          highest_qualification?: string | null
          id?: string
          intake?: string | null
          interview_at?: string | null
          interview_location?: string | null
          interview_notes?: string | null
          interview_score?: number | null
          mean_grade?: string | null
          national_id?: string | null
          notes?: string | null
          phone?: string
          previous_school?: string | null
          reference?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          staff_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          content_id: string | null
          content_type: string
          created_at: string
          details: Json | null
          id: string
          summary: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          content_id?: string | null
          content_type: string
          created_at?: string
          details?: Json | null
          id?: string
          summary?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          content_id?: string | null
          content_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          summary?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          handled: boolean
          id: string
          message: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          handled?: boolean
          id?: string
          message: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          handled?: boolean
          id?: string
          message?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          accepting_applications: boolean
          archived: boolean
          category: string
          course_code: string | null
          created_at: string
          department_id: string | null
          description: string | null
          duration: string | null
          entry_requirement: string | null
          exam_body: string | null
          featured: boolean
          fee: number | null
          id: string
          image_url: string | null
          instructor: string | null
          intake: string | null
          level: string | null
          minimum_grade: string | null
          mode_of_study: string | null
          name: string
          og_image_url: string | null
          publish_at: string | null
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: string
          units: Json
          updated_at: string
        }
        Insert: {
          accepting_applications?: boolean
          archived?: boolean
          category?: string
          course_code?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          duration?: string | null
          entry_requirement?: string | null
          exam_body?: string | null
          featured?: boolean
          fee?: number | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          intake?: string | null
          level?: string | null
          minimum_grade?: string | null
          mode_of_study?: string | null
          name: string
          og_image_url?: string | null
          publish_at?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: string
          units?: Json
          updated_at?: string
        }
        Update: {
          accepting_applications?: boolean
          archived?: boolean
          category?: string
          course_code?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          duration?: string | null
          entry_requirement?: string | null
          exam_body?: string | null
          featured?: boolean
          fee?: number | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          intake?: string | null
          level?: string | null
          minimum_grade?: string | null
          mode_of_study?: string | null
          name?: string
          og_image_url?: string | null
          publish_at?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: string
          units?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          archived: boolean
          created_at: string
          description: string | null
          head_name: string | null
          id: string
          image_url: string | null
          name: string
          publish_at: string | null
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          description?: string | null
          head_name?: string | null
          id?: string
          image_url?: string | null
          name: string
          publish_at?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          description?: string | null
          head_name?: string | null
          id?: string
          image_url?: string | null
          name?: string
          publish_at?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          archived: boolean
          category: string | null
          created_at: string
          description: string | null
          file_name: string | null
          file_url: string
          id: string
          is_public: boolean
          media_id: string | null
          publish_at: string | null
          size_bytes: number | null
          sort_order: number
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          archived?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          is_public?: boolean
          media_id?: string | null
          publish_at?: string | null
          size_bytes?: number | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          archived?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          is_public?: boolean
          media_id?: string | null
          publish_at?: string | null
          size_bytes?: number | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          full_name: string
          id: string
          notes: string | null
          phone: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          album_id: string | null
          archived: boolean
          category: string | null
          contact_info: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          featured: boolean
          id: string
          image_url: string | null
          location: string | null
          poster_url: string | null
          publish_at: string | null
          published: boolean
          registration_link: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          album_id?: string | null
          archived?: boolean
          category?: string | null
          contact_info?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          location?: string | null
          poster_url?: string | null
          publish_at?: string | null
          published?: boolean
          registration_link?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          starts_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          album_id?: string | null
          archived?: boolean
          category?: string | null
          contact_info?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          location?: string | null
          poster_url?: string | null
          publish_at?: string | null
          published?: boolean
          registration_link?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          starts_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          archived: boolean
          category: string | null
          created_at: string
          id: string
          publish_at: string | null
          published: boolean
          question: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          answer: string
          archived?: boolean
          category?: string | null
          created_at?: string
          id?: string
          publish_at?: string | null
          published?: boolean
          question: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: string
          archived?: boolean
          category?: string | null
          created_at?: string
          id?: string
          publish_at?: string | null
          published?: boolean
          question?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          archived: boolean
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          event_date: string | null
          featured: boolean
          id: string
          location: string | null
          publish_at: string | null
          published: boolean
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          featured?: boolean
          id?: string
          location?: string | null
          publish_at?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          featured?: boolean
          id?: string
          location?: string | null
          publish_at?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          album_id: string | null
          alt_text: string | null
          archived: boolean
          caption: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image_url: string
          location: string | null
          media_id: string | null
          publish_at: string | null
          published: boolean
          sort_order: number
          status: string
          taken_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          album_id?: string | null
          alt_text?: string | null
          archived?: boolean
          caption?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url: string
          location?: string | null
          media_id?: string | null
          publish_at?: string | null
          published?: boolean
          sort_order?: number
          status?: string
          taken_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          album_id?: string | null
          alt_text?: string | null
          archived?: boolean
          caption?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string
          location?: string | null
          media_id?: string | null
          publish_at?: string | null
          published?: boolean
          sort_order?: number
          status?: string
          taken_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          body: string | null
          cta_label: string | null
          cta_link: string | null
          data: Json
          enabled: boolean
          id: string
          image_url: string | null
          key: string
          secondary_cta_label: string | null
          secondary_cta_link: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          cta_label?: string | null
          cta_link?: string | null
          data?: Json
          enabled?: boolean
          id?: string
          image_url?: string | null
          key: string
          secondary_cta_label?: string | null
          secondary_cta_link?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          cta_label?: string | null
          cta_link?: string | null
          data?: Json
          enabled?: boolean
          id?: string
          image_url?: string | null
          key?: string
          secondary_cta_label?: string | null
          secondary_cta_link?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          bucket: string
          caption: string | null
          category: string
          created_at: string
          description: string | null
          file_name: string
          height: number | null
          id: string
          mime_type: string | null
          path: string
          size_bytes: number | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket?: string
          caption?: string | null
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          height?: number | null
          id?: string
          mime_type?: string | null
          path: string
          size_bytes?: number | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket?: string
          caption?: string | null
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          path?: string
          size_bytes?: number | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      news_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          archived: boolean
          author_id: string | null
          author_name: string | null
          body: string | null
          category: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          image_url: string | null
          images: Json
          og_image_url: string | null
          publish_at: string | null
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          author_id?: string | null
          author_name?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          og_image_url?: string | null
          publish_at?: string | null
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          author_id?: string | null
          author_name?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          og_image_url?: string | null
          publish_at?: string | null
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          archived: boolean
          bio: string | null
          created_at: string
          department_id: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          photo_url: string | null
          position: string | null
          publish_at: string | null
          published: boolean
          sort_order: number
          specialization: string | null
          staff_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          bio?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          publish_at?: string | null
          published?: boolean
          sort_order?: number
          specialization?: string | null
          staff_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          bio?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          publish_at?: string | null
          published?: boolean
          sort_order?: number
          specialization?: string | null
          staff_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      success_stories: {
        Row: {
          achievement: string | null
          archived: boolean
          consent_obtained: boolean
          course_name: string | null
          created_at: string
          featured: boolean
          graduation_year: string | null
          id: string
          photo_url: string | null
          publish_at: string | null
          published: boolean
          quote: string | null
          sort_order: number
          status: string
          story: string
          student_name: string
          updated_at: string
        }
        Insert: {
          achievement?: string | null
          archived?: boolean
          consent_obtained?: boolean
          course_name?: string | null
          created_at?: string
          featured?: boolean
          graduation_year?: string | null
          id?: string
          photo_url?: string | null
          publish_at?: string | null
          published?: boolean
          quote?: string | null
          sort_order?: number
          status?: string
          story: string
          student_name: string
          updated_at?: string
        }
        Update: {
          achievement?: string | null
          archived?: boolean
          consent_obtained?: boolean
          course_name?: string | null
          created_at?: string
          featured?: boolean
          graduation_year?: string | null
          id?: string
          photo_url?: string | null
          publish_at?: string | null
          published?: boolean
          quote?: string | null
          sort_order?: number
          status?: string
          story?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          archived: boolean
          course_name: string | null
          created_at: string
          featured: boolean
          id: string
          name: string
          photo_url: string | null
          publish_at: string | null
          published: boolean
          role: string | null
          sort_order: number
          status: string
          testimonial: string
          updated_at: string
          year: string | null
        }
        Insert: {
          archived?: boolean
          course_name?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          name: string
          photo_url?: string | null
          publish_at?: string | null
          published?: boolean
          role?: string | null
          sort_order?: number
          status?: string
          testimonial: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          archived?: boolean
          course_name?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          name?: string
          photo_url?: string | null
          publish_at?: string | null
          published?: boolean
          role?: string | null
          sort_order?: number
          status?: string
          testimonial?: string
          updated_at?: string
          year?: string | null
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
      can_manage_academics: { Args: { _user_id: string }; Returns: boolean }
      can_manage_admissions: { Args: { _user_id: string }; Returns: boolean }
      can_manage_content: { Args: { _user_id: string }; Returns: boolean }
      content_is_live: {
        Args: { _publish_at: string; _status: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_portal_staff: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "staff"
        | "trainer"
        | "student"
        | "applicant"
        | "super_admin"
        | "content_manager"
        | "finance_officer"
        | "admissions_officer"
        | "academic_officer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "admin",
        "staff",
        "trainer",
        "student",
        "applicant",
        "super_admin",
        "content_manager",
        "finance_officer",
        "admissions_officer",
        "academic_officer",
      ],
    },
  },
} as const
