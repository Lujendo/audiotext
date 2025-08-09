export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'student' | 'professional' | 'copywriter' | 'video_editor' | 'admin' | 'subscriber';
  avatar?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  stripe_customer_id?: string;
  subscription_status?: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'free';
  subscription_id?: string;
  plan_type?: 'free' | 'pro' | 'enterprise';
}

export interface DatabaseSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  plan_type: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  stripe_product_id: string;
  stripe_price_id: string;
  name: string;
  description: string;
  price_amount: number;
  price_currency: string;
  billing_interval: 'month' | 'year';
  plan_type: 'free' | 'pro' | 'enterprise';
  features: string; // JSON string
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserPreferences {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_transcription_complete: boolean;
  notifications_weekly_digest: boolean;
  editor_font_size: number;
  editor_font_family: string;
  editor_auto_save: boolean;
  editor_spell_check: boolean;
  created_at: string;
  updated_at: string;
}



export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tags: string; // JSON string
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
}

export interface DatabaseProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'admin';
  added_at: string;
}

export interface DatabaseAudioFile {
  id: string;
  user_id: string;
  project_id?: string;
  filename: string;
  original_name: string;
  size: number;
  duration?: number;
  mime_type: string;
  url: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface DatabaseTranscription {
  id: string;
  audio_file_id: string;
  user_id: string;
  text: string;
  edited_text?: string;
  confidence: number;
  language: string;
  status: 'processing' | 'completed' | 'failed';
  segments: string; // JSON string
  last_edited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseActivityLog {
  id: string;
  user_id: string;
  type: string;
  description: string;
  metadata?: string; // JSON string
  timestamp: string;
}

export interface DatabaseExport {
  id: string;
  user_id: string;
  transcription_id: string;
  format: string;
  quality: 'standard' | 'professional';
  options?: string; // JSON string
  file_url?: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// Utility types for creating new records
export type CreateUser = Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at' | 'last_login' | 'is_active'> & {
  email_verified?: boolean;
};
export type CreateProject = Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at' | 'last_accessed_at'>;
export type CreateAudioFile = Omit<DatabaseAudioFile, 'id' | 'created_at' | 'updated_at'>;
export type CreateTranscription = Omit<DatabaseTranscription, 'id' | 'created_at' | 'updated_at'>;
export type CreateActivityLog = Omit<DatabaseActivityLog, 'id' | 'timestamp'>;
export type CreateExport = Omit<DatabaseExport, 'id' | 'created_at' | 'updated_at'>;

// Update types
export type UpdateUser = Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>;
export type UpdateProject = Partial<Omit<DatabaseProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type UpdateAudioFile = Partial<Omit<DatabaseAudioFile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type UpdateTranscription = Partial<Omit<DatabaseTranscription, 'id' | 'audio_file_id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type UpdateExport = Partial<Omit<DatabaseExport, 'id' | 'user_id' | 'transcription_id' | 'created_at' | 'updated_at'>>;

// Database utility functions
export function generateId(): string {
  return crypto.randomUUID();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
