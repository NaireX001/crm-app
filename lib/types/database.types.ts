// Hand-written types matching supabase/schema.sql.
// If you later run `supabase gen types typescript`, you can replace this
// file with the generated version — the shape should match closely.

export type UserRole = "admin" | "sales_rep" | "viewer";
export type ActivityType = "call" | "email" | "note" | "meeting";
export type TaskStatus = "pending" | "completed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company_id: string | null;
  tags: string[];
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  sort_order: number;
  is_won: boolean;
  is_lost: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  name: string;
  contact_id: string | null;
  company_id: string | null;
  stage_id: string;
  value: number;
  currency: string;
  close_date: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string | null;
  body: string | null;
  contact_id: string | null;
  deal_id: string | null;
  owner_id: string | null;
  occurred_at: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  contact_id: string | null;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
}

// Supabase client generic — lets `createClient<Database>()` type queries.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile> };
      companies: { Row: Company; Insert: Partial<Company> & { name: string }; Update: Partial<Company> };
      contacts: { Row: Contact; Insert: Partial<Contact> & { first_name: string }; Update: Partial<Contact> };
      pipeline_stages: { Row: PipelineStage; Insert: Partial<PipelineStage> & { name: string; sort_order: number }; Update: Partial<PipelineStage> };
      deals: { Row: Deal; Insert: Partial<Deal> & { name: string; stage_id: string }; Update: Partial<Deal> };
      activities: { Row: Activity; Insert: Partial<Activity> & { type: ActivityType }; Update: Partial<Activity> };
      tasks: { Row: Task; Insert: Partial<Task> & { title: string }; Update: Partial<Task> };
    };
  };
}
