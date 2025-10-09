# SketchFlow - Open Source Implementation Summary

## Overview

SketchFlow is now fully open-source and ready for community contributions! This document provides a comprehensive overview of the implementation, architecture, and features.

## ✅ Recent Implementations

### 1. Export & Download Features
- **Single Project Export**: Download complete projects as ZIP files
- **Account Export**: Backup all projects with full folder structure
- **File Formats**: 
  - Documents as `.md` (Markdown)
  - Canvases as `.excalidraw` (Excalidraw JSON)
  - Complete metadata in JSON format

### 2. Excalidraw Library System
- **Official Libraries**: Fetches from `https://libraries.excalidraw.com/libraries.json`
- **Search & Filter**: Search libraries by name, description, and tags
- **Infinite Scroll**: Efficient loading of library items
- **Grid View**: Clean, organized display of library previews
- **One-Click Insert**: Direct integration into canvas

### 3. Auto-Save System
- **Debounced Saving**: 1.5s delay for documents, 1s for canvases
- **Visual Indicators**: Status dots show "Saving..." and "Saved"
- **Keyboard Shortcut**: Cmd/Ctrl+S for manual save
- **Change Detection**: Proper tracking using Plate.js `onChange` event

### 4. Open Source Preparation
- **MIT License**: Permissive open-source license
- **Contributing Guide**: Comprehensive contribution guidelines
- **Security Policy**: Responsible disclosure process
- **Changelog**: Version history and release notes
- **Documentation**: Complete technical and user documentation

## 🏗️ Architecture

### Database Layer
```
Turso (LibSQL) + Drizzle ORM
├── Users & Authentication (Stack Auth)
├── Projects & Templates
├── Documents (Plate.js content)
├── Canvases (Excalidraw elements)
├── Collaborators & Teams
└── Files & Shares
```

### Frontend Architecture
```
Next.js 15 (App Router)
├── /app - Routes & API endpoints
│   ├── (dashboard) - Project listing
│   ├── workspace/[id] - Workspace UI
│   ├── api/ - Server endpoints
│   └── project/[id] - Project views
├── /components
│   ├── canvas/ - Excalidraw components
│   ├── editor/ - Plate.js components
│   ├── workspace/ - Workspace UI
│   └── ui/ - shadcn/ui components
├── /lib
│   ├── actions/ - Server actions
│   ├── db/ - Database schema
│   ├── stores/ - Zustand state
│   └── utils/ - Utilities
└── /hooks - Custom React hooks
```

### State Management
```
Zustand Stores
├── useWorkspaceStore - Workspace state
├── useCanvasStore - Canvas state
└── File operations tracking
```

### Data Flow
```
User Input
↓
React Component
↓
onChange Handler (Plate.js/Excalidraw)
↓
State Update (Zustand)
↓
Debounced Auto-save
↓
API Route (/api/documents or /api/canvas)
↓
Drizzle ORM
↓
Turso Database
```

## 📊 Key Features Implementation

### Document Editor (Plate.js)
```typescript
// Change detection
onChange: ({ value }) => {
  const hasChanged = JSON.stringify(value) !== JSON.stringify(original);
  if (hasChanged) {
    setHasUnsavedChanges(true);
    // Trigger auto-save after debounce
  }
}

// Auto-save implementation
useEffect(() => {
  if (hasUnsavedChanges && !isSaving) {
    const timer = setTimeout(() => {
      saveDocument(content, true); // isAutoSave = true
    }, 1500);
    return () => clearTimeout(timer);
  }
}, [debouncedContent]);
```

### Canvas Editor (Excalidraw)
```typescript
// Change detection
const handleCanvasChange = (elements, appState, files) => {
  setIsDirty(true);
  
  // Debounced save
  clearTimeout(saveTimeoutRef.current);
  saveTimeoutRef.current = setTimeout(() => {
    onSave?.({ elements, appState, files });
  }, 1000);
};
```

### Library System
```typescript
// Fetch official libraries
const fetchLibraries = async () => {
  const response = await fetch(
    'https://libraries.excalidraw.com/libraries.json'
  );
  const data = await response.json();
  setLibraries(Array.isArray(data) ? data : data.libraries || []);
};

// Search and filter
const filtered = libraries.filter(lib => {
  const query = searchQuery.toLowerCase();
  return lib.name?.toLowerCase().includes(query) ||
         lib.description?.toLowerCase().includes(query);
});

// Infinite scroll
const handleScroll = () => {
  if (scrollHeight - scrollTop <= clientHeight * 1.5) {
    setPage(prev => prev + 1);
  }
};
```

### Export System
```typescript
// Project export
const exportProject = async (projectId) => {
  const zip = new JSZip();
  
  // Add metadata
  zip.file('metadata.json', JSON.stringify(metadata));
  
  // Add documents as .md files
  documents.forEach(doc => {
    zip.file(`documents/${doc.title}.md`, markdownContent);
  });
  
  // Add canvases as .excalidraw files
  canvases.forEach(canvas => {
    zip.file(`canvases/${canvas.title}.excalidraw`, JSON.stringify(canvas));
  });
  
  // Generate and download
  const content = await zip.generateAsync({ type: 'uint8array' });
  downloadFile(content, `${projectName}_export.zip`);
};
```

## 🔐 Security Implementations

### Authentication Flow
1. User signs in via Stack Auth
2. Session token stored securely
3. All API routes validate authentication
4. Database queries filtered by user ID

### Data Access Control
```typescript
// API route pattern
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify project access
  const hasAccess = await verifyProjectAccess(projectId, userId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Return data
}
```

### Environment Variables
All sensitive data stored in `.env.local`:
- Database credentials (Turso)
- API keys (Pexels, ImgBB, etc.)
- Auth secrets (Stack Auth)

## 📝 API Endpoints

### Documents
- `GET /api/documents/[id]` - Get document
- `PATCH /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/projects/[id]/documents` - Create document

### Canvases
- `GET /api/canvas/[id]` - Get canvas
- `PATCH /api/canvas/[id]` - Update canvas
- `DELETE /api/canvas/[id]` - Delete canvas
- `POST /api/projects/[id]/canvases` - Create canvas

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Export
- `GET /api/export/project?projectId=[id]` - Export project as ZIP
- `GET /api/export/account` - Export all projects as ZIP

### Images
- `GET /api/images/search?query=[term]` - Search Pexels images

## 🧪 Testing Guide

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests (future)
npm run test:e2e

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Manual Testing Checklist
- [ ] Create new project
- [ ] Create document and canvas
- [ ] Edit document with auto-save
- [ ] Edit canvas with auto-save
- [ ] Test Cmd/Ctrl+S keyboard shortcut
- [ ] Open library panel
- [ ] Search for libraries
- [ ] Insert library into canvas
- [ ] Export single project
- [ ] Export entire account
- [ ] Share project publicly
- [ ] Test responsive design on mobile

## 🚀 Deployment

### Environment Setup
1. Create Turso database
2. Configure Stack Auth project
3. Get API keys (Pexels, ImgBB, etc.)
4. Set up Cloudflare Pages or Vercel

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy
npm run deploy  # For Cloudflare
# or
vercel deploy   # For Vercel
```

### Database Migrations
```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push

# View database in Studio
npm run db:studio
```

## 📈 Performance Optimizations

1. **Code Splitting**: Lazy loading for Excalidraw and Plate.js
2. **Debouncing**: Auto-save debounced to reduce API calls
3. **SWR Caching**: Aggressive caching for project data
4. **Image Optimization**: Next.js Image component
5. **PWA**: Service worker for offline support

## 🐛 Known Issues & Limitations

1. **Large Canvases**: Performance degrades with 500+ elements
2. **Real-time Collaboration**: Limited to basic locking
3. **Mobile Experience**: Some features better on desktop
4. **File Storage**: Limited to third-party APIs (ImgBB, etc.)

## 🔮 Future Roadmap

### Short Term (v0.2.0)
- [ ] Improved mobile UI
- [ ] More export formats (PDF, HTML)
- [ ] Template marketplace
- [ ] Advanced search

### Medium Term (v0.3.0)
- [ ] Real-time collaboration (CRDT)
- [ ] Version history
- [ ] Comments and annotations
- [ ] Custom plugins

### Long Term (v1.0.0)
- [ ] Self-hosted option
- [ ] Desktop app (Electron/Tauri)
- [ ] AI-powered features
- [ ] Advanced analytics

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Excalidraw Documentation](https://docs.excalidraw.com/)
- [Plate.js Documentation](https://platejs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Turso](https://docs.turso.tech/)
- [Stack Auth](https://docs.stack-auth.com/)

## 🤝 Community

### Ways to Contribute
1. **Code**: Submit PRs for features or fixes
2. **Documentation**: Improve docs and guides
3. **Design**: Create UI/UX improvements
4. **Testing**: Report bugs and edge cases
5. **Support**: Help others in issues/discussions

### Communication
- GitHub Issues for bugs and features
- Discussions for questions and ideas
- Discord for community chat (coming soon)

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Version**: 0.1.0  
**Last Updated**: October 9, 2025  
**Status**: Open Source & Production Ready

**Maintainers**: @appedme  
**Contributors**: See [Contributors](https://github.com/appedme/sketchflow/graphs/contributors)
