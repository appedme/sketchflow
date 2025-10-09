# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Excalidraw library system with official libraries integration
- Export/download functionality for projects and accounts
- Auto-save feature with Cmd/Ctrl+S keyboard shortcut
- Infinite scroll for library panels
- Library search with name and tag filtering
- Grid view for library items
- PWA support for desktop and mobile installation

### Changed
- Improved canvas editor with better library integration
- Enhanced workspace UI with auto-save status indicators
- Updated documentation with comprehensive guides

### Fixed
- Database migration issues with Turso
- Authentication flow with Stack Auth
- Loading states in workspace pages

## [0.1.0] - 2025-10-09

### Added
- Initial release
- Visual canvas editor powered by Excalidraw
- Rich text editor powered by Plate.js
- Project management system
- User authentication with Stack Auth
- Database integration with Turso (LibSQL)
- Dark mode support
- Responsive design
- File upload capabilities
- Real-time collaboration features (basic)
- Template system
- Project sharing capabilities

### Features
- **Canvas Editor**
  - Drawing tools (rectangle, circle, arrow, line, text)
  - Color picker and styling options
  - Image insertion
  - Export to PNG/SVG
  
- **Document Editor**
  - Rich text formatting (bold, italic, underline)
  - Lists (ordered, unordered, todo)
  - Code blocks with syntax highlighting
  - Tables
  - Links and images
  - Markdown support

- **Workspace**
  - Split view for canvas and documents
  - Multiple tabs support
  - Sidebar navigation
  - Fullscreen mode
  - Project settings

- **Project Management**
  - Create, edit, delete projects
  - Project categories and tags
  - Visibility settings (private, team, public)
  - Collaborator management
  - Project templates

### Technical Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Excalidraw
- Plate.js
- Turso Database
- Drizzle ORM
- Stack Auth
- Zustand
- SWR

### Known Issues
- Some performance issues with large canvases
- Limited real-time collaboration features
- Mobile experience needs optimization

---

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md with release notes
3. Create a git tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
4. Push tags: `git push origin --tags`
5. Create GitHub release with changelog notes
6. Deploy to production

## Version Numbering

We use Semantic Versioning:
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Links

- [Compare Versions](https://github.com/appedme/sketchflow/compare)
- [Release Page](https://github.com/appedme/sketchflow/releases)
- [Issues](https://github.com/appedme/sketchflow/issues)
