# SketchFlow Backend Architecture Plan

## Overview
This document outlines the complete backend architecture for SketchFlow using **Cloudflare D1 Database** with **Drizzle ORM** and **Next.js Server Actions**. No traditional API routes will be used - everything will be handled through server actions for better performance and type safety.

## Technology Stack
- **Database**: Cloudflare D1 (SQLite-based)
- **ORM**: Drizzle ORM
- **Backend**: Next.js Server Actions
- **Authentication**: Clerk
- **File Storage**: Cloudflare R2 / UploadThing
- **Deployment**: Cloudflare Pages

## Frontend Features Analysis

Based on our current frontend implementation, here are all the features that need backend support:

### 1. Authentication & User Management
- User registration and login (handled by Clerk)
- User profiles and settings
- User preferences and workspace settings

### 2. Dashboard Features
- Recent projects display with mock data currently showing:
  - System Architecture Diagram
  - User Journey Map  
  - Database Schema
- Project statistics (total projects, weekly count, collaborators, views)
- Quick actions (new project, templates, team)
- Search functionality across projects

### 3. Project Management
- Create new projects with templates (9 templates available):
  - Blank Canvas, Flowchart, Database Schema
  - Organization Chart, Mind Map, Wireframe
  - Workflow Diagram, System Architecture, Timeline
- Project CRUD operations
- Project categories: Technical, Business, Creative, Design, Planning
- Visibility settings: Private, Team, Public
- Project sharing and collaboration

### 4. Document System
- Document creation and editing using Plate.js editor
- Document versioning and history
- Rich text content storage (BasicNodesKit)
- Document sharing and permissions
- Document search and organization
- Multiple document views: PlateDocumentEditor, SplitViewDocumentEditor, FullScreenDocumentEditor

### 5. Canvas/Drawing System
- Excalidraw canvas data storage
- Canvas versioning and history
- Canvas sharing and embedding
- Canvas export functionality
- EmbedCanvas component for public viewing

### 6. Collaboration Features
- Real-time collaboration support
- User permissions (view, edit, admin)
- Team management
- Project sharing with different access levels
- Collaborator avatars and presence

### 7. Sharing & Embedding
- Public/private project sharing via ShareDialog
- Embed code generation with customizable options:
  - Size presets (Small 600x400, Medium 800x600, Large 1200x800)
  - Toolbar visibility toggle
  - Edit permissions toggle
- Share link management
- Social media sharing (Twitter, LinkedIn, Email)
- Access control for shared content

### 8. Split View & Multi-Panel
- Resizable panel system using ResizablePanelGroup
- Layout preferences storage in localStorage
- Panel size persistence across sessions
- View state management for different layouts

### 9. File Management
- File uploads and storage
- Image and media handling for documents and canvas
- File versioning
- File sharing and permissions

### 10. URL Management & Routing
- Project-specific URLs: /project/[id]
- Document URLs: /project/[id]/document/[documentId]
- Canvas URLs: /project/[id]/canvas/[canvasId]
- Split view URLs: /project/[id]/split?left=[itemId]&leftType=[type]&right=[itemId]&rightType=[type]
- Embed URLs: /embed/project/[id]?toolbar=[bool]&edit=[bool]

## Database Schema Design

### Core Tables

#### 1. Users Table
```sql
-- Managed by Clerk, but we'll store additional user data
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  preferences JSON, -- User preferences and settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Projects Table
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- technical, business, creative, design, planning
  visibility TEXT NOT NULL DEFAULT 'private', -- private, team, public
  template_id TEXT,
  owner_id TEXT NOT NULL,
  thumbnail_url TEXT,
  settings JSON, -- Project-specific settings
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);
```

#### 3. Documents Table
```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSON, -- Plate.js editor content (BasicNodesKit format)
  content_text TEXT, -- Searchable text content
  version INTEGER DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 4. Canvases Table
```sql
CREATE TABLE canvases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  elements JSON, -- Excalidraw elements
  app_state JSON, -- Excalidraw app state
  files JSON, -- Excalidraw files
  version INTEGER DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 5. Templates Table
```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- General, Process, Technical, Business, Creative, Design, Planning
  icon TEXT, -- Lucide icon name
  is_popular BOOLEAN DEFAULT FALSE,
  template_data JSON, -- Template structure and default content
  preview_image TEXT,
  created_by TEXT,
  is_system BOOLEAN DEFAULT FALSE, -- System templates vs user templates
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 6. Project Collaborators Table
```sql
CREATE TABLE project_collaborators (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- owner, editor, viewer
  avatar_initials TEXT, -- For display (e.g., "JD", "JS")
  invited_by TEXT NOT NULL,
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  UNIQUE(project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (invited_by) REFERENCES users(id)
);
```

#### 7. Shares Table
```sql
CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  document_id TEXT,
  canvas_id TEXT,
  share_token TEXT UNIQUE NOT NULL,
  share_type TEXT NOT NULL, -- public, private, embed
  embed_settings JSON, -- Toolbar, edit permissions, size settings
  expires_at DATETIME,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 8. Files Table
```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  document_id TEXT,
  canvas_id TEXT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

## Server Actions Structure

### 1. Authentication Actions
```typescript
// src/lib/actions/auth.ts
- createUserProfile(clerkUserId: string, userData: UserData)
- updateUserProfile(userId: string, updates: Partial<UserData>)
- getUserPreferences(userId: string)
- updateUserPreferences(userId: string, preferences: Record<string, any>)
```

### 2. Project Actions
```typescript
// src/lib/actions/projects.ts
- createProject(formData: FormData) // Already exists in new-project/actions.ts
- getProjects(userId: string, filters?: ProjectFilters)
- getProject(projectId: string, userId: string)
- updateProject(projectId: string, updates: Partial<Project>)
- deleteProject(projectId: string, userId: string)
- getProjectStats(userId: string)
- searchProjects(userId: string, query: string)
- incrementProjectViews(projectId: string)
```

### 3. Document Actions
```typescript
// src/lib/actions/documents.ts
- createDocument(projectId: string, title: string, userId: string)
- getDocuments(projectId: string)
- getDocument(documentId: string)
- updateDocument(documentId: string, content: any, title?: string)
- deleteDocument(documentId: string, userId: string)
- getDocumentVersions(documentId: string)
```

### 4. Canvas Actions
```typescript
// src/lib/actions/canvases.ts
- createCanvas(projectId: string, title: string, userId: string)
- getCanvases(projectId: string)
- getCanvas(canvasId: string)
- updateCanvas(canvasId: string, elements: any, appState: any, files?: any)
- deleteCanvas(canvasId: string, userId: string)
- getCanvasVersions(canvasId: string)
```

### 5. Collaboration Actions
```typescript
// src/lib/actions/collaboration.ts
- inviteCollaborator(projectId: string, email: string, role: string, invitedBy: string)
- removeCollaborator(projectId: string, userId: string, removedBy: string)
- updateCollaboratorRole(projectId: string, userId: string, newRole: string)
- getCollaborators(projectId: string)
- acceptInvitation(invitationId: string, userId: string)
```

### 6. Sharing Actions
```typescript
// src/lib/actions/sharing.ts
- createShare(itemId: string, itemType: 'project' | 'document' | 'canvas', settings: ShareSettings)
- getShare(shareToken: string)
- updateShareSettings(shareId: string, settings: ShareSettings)
- deleteShare(shareId: string, userId: string)
- getPublicProject(shareToken: string)
```

### 7. Template Actions
```typescript
// src/lib/actions/templates.ts
- getTemplates(category?: string, popularOnly?: boolean)
- getTemplate(templateId: string)
- createTemplate(templateData: TemplateData, userId: string)
- updateTemplate(templateId: string, updates: Partial<TemplateData>)
- deleteTemplate(templateId: string, userId: string)
```

### 8. File Actions
```typescript
// src/lib/actions/files.ts
- uploadFile(file: File, projectId?: string, documentId?: string, canvasId?: string)
- getFiles(projectId?: string, documentId?: string, canvasId?: string)
- deleteFile(fileId: string, userId: string)
- getFileUrl(fileId: string)
```

## Implementation Plan

### Phase 1: Database Setup (Following Cloudflare D1 + Drizzle Guide)
1. **Setup Cloudflare D1 Database**
   - Follow: https://dev.to/sh20raj/cloudflare-d1-drizzle-orm-setup-guide-3oap
   - Install dependencies: drizzle-orm, drizzle-kit, @cloudflare/workers-types
   - Configure wrangler.toml for D1 database
   - Setup Drizzle config file
   - Create database schema using Drizzle

2. **Database Migration**
   - Create initial migration files
   - Setup system templates (9 default templates)
   - Create indexes for performance

### Phase 2: Core Server Actions
1. **Project Management**
   - Implement createProject action (enhance existing one)
   - Add getProjects for dashboard
   - Add project statistics calculation
   - Implement search functionality

2. **Document & Canvas System**
   - Document CRUD operations with Plate.js content
   - Canvas CRUD operations with Excalidraw data
   - Version management system

### Phase 3: Advanced Features
1. **Collaboration System**
   - User invitation system
   - Permission management
   - Collaborator management

2. **Sharing & Embedding**
   - Share token generation
   - Embed settings management
   - Public access control

3. **File Management**
   - Integration with UploadThing/Cloudflare R2
   - File upload and storage
   - File permissions and access

### Phase 4: UI Integration
1. **Dashboard Integration**
   - Replace mock data with real database queries
   - Implement search functionality
   - Add project statistics

2. **Editor Integration**
   - Connect Plate.js editor with document storage
   - Connect Excalidraw with canvas storage
   - Implement auto-save functionality

3. **Sharing Integration**
   - Connect ShareDialog with backend
   - Implement embed functionality
   - Add public sharing pages

## File Structure
```
src/
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   ├── migrations/        # Database migrations
│   │   └── index.ts          # Database connection
│   ├── actions/              # Server actions
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── documents.ts
│   │   ├── canvases.ts
│   │   ├── collaboration.ts
│   │   ├── sharing.ts
│   │   ├── templates.ts
│   │   └── files.ts
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
```

## Security Considerations
1. **Authentication**: All server actions validate Clerk user authentication
2. **Authorization**: Check user permissions for each operation
3. **Data Validation**: Use Zod schemas for input validation
4. **Rate Limiting**: Implement rate limiting for sensitive operations
5. **SQL Injection**: Use Drizzle ORM parameterized queries
6. **XSS Protection**: Sanitize user inputs, especially rich text content

## Next Steps
1. **Setup Cloudflare D1** following the provided guide
2. **Configure Drizzle ORM** with the complete schema
3. **Implement core server actions** starting with projects and documents
4. **Replace mock data** in dashboard with real database queries
5. **Add collaboration features** and sharing functionality
6. **Implement file upload** and storage system
7. **Add analytics and monitoring** for usage tracking

This architecture provides a comprehensive backend that supports all current frontend features while being scalable and maintainable using modern serverless technologies.
