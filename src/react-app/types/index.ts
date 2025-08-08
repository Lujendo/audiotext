export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
  subscription?: Subscription
  preferences: UserPreferences
}

export type UserRole = 'student' | 'professional' | 'copywriter' | 'video_editor' | 'admin'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    transcriptionComplete: boolean
    weeklyDigest: boolean
  }
  editor: {
    fontSize: number
    fontFamily: string
    autoSave: boolean
    spellCheck: boolean
  }
}

export interface Subscription {
  id: string
  plan: 'free' | 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  usage: {
    transcriptionMinutes: number
    storageUsed: number
    exportsCount: number
  }
  limits: {
    transcriptionMinutes: number
    storageLimit: number
    exportsPerMonth: number
  }
}

export interface AudioFile {
  id: string
  userId: string
  filename: string
  originalName: string
  size: number
  duration: number
  mimeType: string
  url: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  transcription?: Transcription
}

export interface Transcription {
  id: string
  audioFileId: string
  userId: string
  text: string
  confidence: number
  language: string
  status: 'processing' | 'completed' | 'failed'
  segments: TranscriptionSegment[]
  createdAt: Date
  updatedAt: Date
  editedText?: string
  lastEditedAt?: Date
}

export interface TranscriptionSegment {
  id: string
  start: number
  end: number
  text: string
  confidence: number
  speaker?: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  audioFiles: AudioFile[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastAccessedAt: Date
  isShared: boolean
  collaborators: ProjectCollaborator[]
}

export interface ProjectCollaborator {
  userId: string
  role: 'viewer' | 'editor' | 'admin'
  addedAt: Date
}

export interface ExportFormat {
  type: 'pdf' | 'docx' | 'txt' | 'srt' | 'vtt' | 'json'
  quality: 'standard' | 'professional'
  options: ExportOptions
}

export interface ExportOptions {
  includeTimestamps?: boolean
  includeSpeakerLabels?: boolean
  includeConfidenceScores?: boolean
  formatting?: {
    fontSize?: number
    fontFamily?: string
    lineSpacing?: number
    margins?: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  watermark?: boolean
  metadata?: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchResult {
  id: string
  type: 'transcription' | 'project' | 'audio_file'
  title: string
  snippet: string
  score: number
  metadata: Record<string, any>
}

export interface AnalyticsData {
  totalTranscriptions: number
  totalMinutesTranscribed: number
  totalStorageUsed: number
  totalExports: number
  recentActivity: ActivityItem[]
  usageByMonth: MonthlyUsage[]
}

export interface ActivityItem {
  id: string
  type: 'transcription_created' | 'file_uploaded' | 'export_generated' | 'project_created'
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface MonthlyUsage {
  month: string
  transcriptionMinutes: number
  storageUsed: number
  exports: number
}
