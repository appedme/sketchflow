import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table - extends Clerk user data
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  preferences: text('preferences', { mode: 'json' }), // JSON field for user preferences
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Templates table
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // General, Process, Technical, Business, Creative, Design, Planning
  icon: text('icon'), // Lucide icon name
  isPopular: integer('is_popular', { mode: 'boolean' }).default(false),
  templateData: text('template_data', { mode: 'json' }), // Template structure and default content
  previewImage: text('preview_image'),
  createdBy: text('created_by').references(() => users.id),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false), // System templates vs user templates
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // technical, business, creative, design, planning
  visibility: text('visibility').notNull().default('private'), // private, team, public
  templateId: text('template_id').references(() => templates.id),
  ownerId: text('owner_id').notNull().references(() => users.id),
  thumbnailUrl: text('thumbnail_url'),
  settings: text('settings', { mode: 'json' }), // Project-specific settings
  viewCount: integer('view_count').default(0),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  tags: text('tags', { mode: 'json' }), // Array of tags for organization
  status: text('status').default('active'), // active, archived, completed
  lastActivityAt: text('last_activity_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Documents table
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content', { mode: 'json' }), // Plate.js editor content (Plate format)
  contentText: text('content_text'), // Searchable text content extracted from Plate content
  wordCount: integer('word_count').default(0), // Word count for analytics
  readingTime: integer('reading_time').default(0), // Estimated reading time in minutes
  version: integer('version').default(1),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  tags: text('tags', { mode: 'json' }), // Array of tags for organization
  status: text('status').default('draft'), // draft, published, archived
  lastEditedBy: text('last_edited_by').references(() => users.id),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Canvases table
export const canvases = sqliteTable('canvases', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  elements: text('elements', { mode: 'json' }), // Excalidraw elements
  appState: text('app_state', { mode: 'json' }), // Excalidraw app state
  files: text('files', { mode: 'json' }), // Excalidraw files
  elementCount: integer('element_count').default(0), // Number of elements for analytics
  version: integer('version').default(1),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  tags: text('tags', { mode: 'json' }), // Array of tags for organization
  status: text('status').default('draft'), // draft, published, archived
  lastEditedBy: text('last_edited_by').references(() => users.id),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Project collaborators table
export const projectCollaborators = sqliteTable('project_collaborators', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('viewer'), // owner, editor, viewer
  avatarInitials: text('avatar_initials'), // For display (e.g., "JD", "JS")
  invitedBy: text('invited_by').notNull().references(() => users.id),
  invitedAt: text('invited_at').default(sql`CURRENT_TIMESTAMP`),
  acceptedAt: text('accepted_at'),
});

// Shares table
export const shares = sqliteTable('shares', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  documentId: text('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  canvasId: text('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }),
  shareToken: text('share_token').notNull().unique(),
  shareType: text('share_type').notNull(), // public, private, embed
  embedSettings: text('embed_settings', { mode: 'json' }), // Toolbar, edit permissions, size settings
  expiresAt: text('expires_at'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Files table
export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  documentId: text('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  canvasId: text('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  storageUrl: text('storage_url').notNull(),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User preferences table
export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  preferenceKey: text('preference_key').notNull(),
  preferenceValue: text('preference_value', { mode: 'json' }).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Split view settings table
export const splitViewSettings = sqliteTable('split_view_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  leftItemId: text('left_item_id'),
  rightItemId: text('right_item_id'),
  leftPanelSize: integer('left_panel_size').default(50),
  rightPanelSize: integer('right_panel_size').default(50),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Canvas = typeof canvases.$inferSelect;
export type NewCanvas = typeof canvases.$inferInsert;

export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type NewProjectCollaborator = typeof projectCollaborators.$inferInsert;

export type Share = typeof shares.$inferSelect;
export type NewShare = typeof shares.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

export type SplitViewSetting = typeof splitViewSettings.$inferSelect;
export type NewSplitViewSetting = typeof splitViewSettings.$inferInsert;