import {
  DatabaseUser,
  DatabaseProject,
  DatabaseAudioFile,
  DatabaseTranscription,
  DatabaseActivityLog,
  DatabaseExport,
  CreateUser,
  CreateProject,
  CreateAudioFile,
  CreateTranscription,
  CreateActivityLog,
  CreateExport,
  UpdateUser,
  UpdateProject,
  UpdateAudioFile,
  UpdateTranscription,
  UpdateExport,
  generateId,
  getCurrentTimestamp,
} from './models';

export class UserRepository {
  constructor(private db: D1Database) {}

  async create(userData: CreateUser): Promise<DatabaseUser> {
    const id = generateId();
    const now = getCurrentTimestamp();
    
    const user: DatabaseUser = {
      ...userData,
      id,
      email_verified: false,
      created_at: now,
      updated_at: now,
    };

    await this.db
      .prepare(`
        INSERT INTO users (id, email, name, password_hash, role, avatar, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        user.id,
        user.email,
        user.name,
        user.password_hash,
        user.role,
        user.avatar,
        user.email_verified,
        user.created_at,
        user.updated_at
      )
      .run();

    return user;
  }

  async findById(id: string): Promise<DatabaseUser | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<DatabaseUser>();
    
    return result || null;
  }

  async findByEmail(email: string): Promise<DatabaseUser | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<DatabaseUser>();
    
    return result || null;
  }

  async update(id: string, updates: UpdateUser): Promise<DatabaseUser | null> {
    const now = getCurrentTimestamp();
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), now, id];

    await this.db
      .prepare(`UPDATE users SET ${updateFields}, updated_at = ? WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM users WHERE id = ?')
      .bind(id)
      .run();

    return result.changes > 0;
  }
}

export class ProjectRepository {
  constructor(private db: D1Database) {}

  async create(projectData: CreateProject): Promise<DatabaseProject> {
    const id = generateId();
    const now = getCurrentTimestamp();
    
    const project: DatabaseProject = {
      ...projectData,
      id,
      created_at: now,
      updated_at: now,
      last_accessed_at: now,
    };

    await this.db
      .prepare(`
        INSERT INTO projects (id, user_id, name, description, tags, is_shared, created_at, updated_at, last_accessed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        project.id,
        project.user_id,
        project.name,
        project.description,
        project.tags,
        project.is_shared,
        project.created_at,
        project.updated_at,
        project.last_accessed_at
      )
      .run();

    return project;
  }

  async findById(id: string): Promise<DatabaseProject | null> {
    const result = await this.db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .bind(id)
      .first<DatabaseProject>();
    
    return result || null;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<DatabaseProject[]> {
    const results = await this.db
      .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY last_accessed_at DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all<DatabaseProject>();
    
    return results.results || [];
  }

  async update(id: string, updates: UpdateProject): Promise<DatabaseProject | null> {
    const now = getCurrentTimestamp();
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), now, id];

    await this.db
      .prepare(`UPDATE projects SET ${updateFields}, updated_at = ? WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async updateLastAccessed(id: string): Promise<void> {
    const now = getCurrentTimestamp();
    await this.db
      .prepare('UPDATE projects SET last_accessed_at = ? WHERE id = ?')
      .bind(now, id)
      .run();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM projects WHERE id = ?')
      .bind(id)
      .run();

    return result.changes > 0;
  }
}

export class AudioFileRepository {
  constructor(private db: D1Database) {}

  async create(audioFileData: CreateAudioFile): Promise<DatabaseAudioFile> {
    const id = generateId();
    const now = getCurrentTimestamp();
    
    const audioFile: DatabaseAudioFile = {
      ...audioFileData,
      id,
      created_at: now,
      updated_at: now,
    };

    await this.db
      .prepare(`
        INSERT INTO audio_files (id, user_id, project_id, filename, original_name, size, duration, mime_type, url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        audioFile.id,
        audioFile.user_id,
        audioFile.project_id,
        audioFile.filename,
        audioFile.original_name,
        audioFile.size,
        audioFile.duration,
        audioFile.mime_type,
        audioFile.url,
        audioFile.status,
        audioFile.created_at,
        audioFile.updated_at
      )
      .run();

    return audioFile;
  }

  async findById(id: string): Promise<DatabaseAudioFile | null> {
    const result = await this.db
      .prepare('SELECT * FROM audio_files WHERE id = ?')
      .bind(id)
      .first<DatabaseAudioFile>();
    
    return result || null;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<DatabaseAudioFile[]> {
    const results = await this.db
      .prepare('SELECT * FROM audio_files WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all<DatabaseAudioFile>();
    
    return results.results || [];
  }

  async findByProjectId(projectId: string): Promise<DatabaseAudioFile[]> {
    const results = await this.db
      .prepare('SELECT * FROM audio_files WHERE project_id = ? ORDER BY created_at DESC')
      .bind(projectId)
      .all<DatabaseAudioFile>();
    
    return results.results || [];
  }

  async update(id: string, updates: UpdateAudioFile): Promise<DatabaseAudioFile | null> {
    const now = getCurrentTimestamp();
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), now, id];

    await this.db
      .prepare(`UPDATE audio_files SET ${updateFields}, updated_at = ? WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM audio_files WHERE id = ?')
      .bind(id)
      .run();

    return result.changes > 0;
  }
}

export class TranscriptionRepository {
  constructor(private db: D1Database) {}

  async create(transcriptionData: CreateTranscription): Promise<DatabaseTranscription> {
    const id = generateId();
    const now = getCurrentTimestamp();

    const transcription: DatabaseTranscription = {
      ...transcriptionData,
      id,
      created_at: now,
      updated_at: now,
    };

    await this.db
      .prepare(`
        INSERT INTO transcriptions (id, audio_file_id, user_id, text, edited_text, confidence, language, status, segments, last_edited_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        transcription.id,
        transcription.audio_file_id,
        transcription.user_id,
        transcription.text,
        transcription.edited_text,
        transcription.confidence,
        transcription.language,
        transcription.status,
        transcription.segments,
        transcription.last_edited_at,
        transcription.created_at,
        transcription.updated_at
      )
      .run();

    return transcription;
  }

  async findById(id: string): Promise<DatabaseTranscription | null> {
    const result = await this.db
      .prepare('SELECT * FROM transcriptions WHERE id = ?')
      .bind(id)
      .first<DatabaseTranscription>();

    return result || null;
  }

  async findByAudioFileId(audioFileId: string): Promise<DatabaseTranscription | null> {
    const result = await this.db
      .prepare('SELECT * FROM transcriptions WHERE audio_file_id = ?')
      .bind(audioFileId)
      .first<DatabaseTranscription>();

    return result || null;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<DatabaseTranscription[]> {
    const results = await this.db
      .prepare('SELECT * FROM transcriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all<DatabaseTranscription>();

    return results.results || [];
  }

  async update(id: string, updates: UpdateTranscription): Promise<DatabaseTranscription | null> {
    const now = getCurrentTimestamp();
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), now, id];

    await this.db
      .prepare(`UPDATE transcriptions SET ${updateFields}, updated_at = ? WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async updateEditedText(id: string, editedText: string): Promise<DatabaseTranscription | null> {
    const now = getCurrentTimestamp();
    await this.db
      .prepare('UPDATE transcriptions SET edited_text = ?, last_edited_at = ?, updated_at = ? WHERE id = ?')
      .bind(editedText, now, now, id)
      .run();

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM transcriptions WHERE id = ?')
      .bind(id)
      .run();

    return result.changes > 0;
  }
}

export class ActivityLogRepository {
  constructor(private db: D1Database) {}

  async create(activityData: CreateActivityLog): Promise<DatabaseActivityLog> {
    const id = generateId();
    const now = getCurrentTimestamp();

    const activity: DatabaseActivityLog = {
      ...activityData,
      id,
      timestamp: now,
    };

    await this.db
      .prepare(`
        INSERT INTO activity_log (id, user_id, type, description, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        activity.id,
        activity.user_id,
        activity.type,
        activity.description,
        activity.metadata,
        activity.timestamp
      )
      .run();

    return activity;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<DatabaseActivityLog[]> {
    const results = await this.db
      .prepare('SELECT * FROM activity_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all<DatabaseActivityLog>();

    return results.results || [];
  }

  async deleteOldEntries(userId: string, daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.db
      .prepare('DELETE FROM activity_log WHERE user_id = ? AND timestamp < ?')
      .bind(userId, cutoffDate.toISOString())
      .run();

    return result.changes;
  }
}
