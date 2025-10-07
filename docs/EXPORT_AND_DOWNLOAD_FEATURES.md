# Export and Download Features

SketchFlow provides comprehensive export functionality to help you backup, migrate, or share your work. You can export individual projects or your entire account as ZIP files containing all your documents, canvases, and metadata.

## Features

### Project Export

- **Individual Project Export**: Download a single project as a ZIP file
- **Complete Content**: Includes all documents (.md), canvases (.excalidraw), and metadata
- **Structured Format**: Organized folder structure for easy navigation
- **Metadata Included**: Project details, creation dates, and content statistics

### Account Export

- **Full Account Backup**: Download all your projects in one ZIP file
- **Multi-Project Structure**: Each project in its own folder
- **Collaborator Access**: Includes projects you have access to (owned or collaborated)
- **Account Metadata**: User information and project overview

## File Structure

### Single Project Export

```
project_name_export.zip
├── metadata.json          # Project metadata and statistics
├── documents/
│   ├── document_title.md  # Markdown content
│   └── ...
└── canvases/
    ├── canvas_title.excalidraw  # Excalidraw JSON format
    └── ...
```

### Account Export

```
account_export.zip
├── account_metadata.json  # User info and project overview
├── project_name_1/
│   ├── metadata.json
│   ├── documents/
│   └── canvases/
├── project_name_2/
│   └── ...
└── ...
```

## How to Export

### Export a Single Project

1. Open any project in the workspace
2. Click the **⋯** (More Options) button in the top-right corner
3. Select **"Export Project"**
4. The download will start automatically

### Export Your Entire Account

1. Go to the **Dashboard** (Projects page)
2. Click the **"Export Account"** button in the header
3. The download will start automatically

## File Formats

### Documents (.md)

- **Format**: Markdown
- **Content**: Full text content from Plate.js editor
- **Metadata**: Creation/update dates, word count, reading time

### Canvases (.excalidraw)

- **Format**: Excalidraw JSON
- **Content**: All elements, app state, and embedded files
- **Compatibility**: Can be opened in Excalidraw or imported into other tools

### Metadata (.json)

- **Project Metadata**: Name, description, category, visibility, dates, tags
- **Content Statistics**: Document count, canvas count, word counts
- **Account Metadata**: User information, total projects, access levels

## Use Cases

### Backup & Recovery

- Regular backups of important projects
- Disaster recovery preparation
- Data migration between accounts

### Sharing & Collaboration

- Share complete projects with team members
- Archive completed work
- Transfer projects to other users

### Migration

- Move data between different SketchFlow instances
- Export for use in other tools
- Create offline archives

## Technical Details

### API Endpoints

- **Project Export**: `GET /api/export/project?projectId={id}`
- **Account Export**: `GET /api/export/account`

### Authentication

- All exports require user authentication
- Access control respects project permissions
- Collaborators can export projects they have access to

### File Size Limits

- Individual files are processed in memory
- Large projects may take time to generate
- ZIP files are streamed for efficient download

### Error Handling

- Failed exports are logged but don't stop the process
- Corrupted content is marked in metadata
- Network issues are handled gracefully

## Troubleshooting

### Export Fails

- Check your internet connection
- Ensure you have access to the project
- Try refreshing the page and attempting again

### Large Files Don't Download

- Check your browser's download settings
- Ensure sufficient disk space
- Try using a different browser

### Missing Content

- Some file types may not be included in exports
- Check the metadata.json for any processing errors
- Contact support if content appears corrupted

## Security & Privacy

### Data Protection

- Exports only include your own data
- No sensitive information is included
- Files are generated server-side and not stored

### Access Control

- Only project owners and collaborators can export
- Private projects remain private in exports
- No data leakage between users

## Future Enhancements

- **Selective Export**: Choose specific documents/canvases
- **Format Options**: PDF, HTML, and other formats
- **Scheduled Exports**: Automated regular backups
- **Cloud Storage Integration**: Direct upload to cloud services
- **Import Functionality**: Restore from exported ZIP files
