# SketchFlow 🎨

> **The modern collaborative workspace for designers and developers** - Seamlessly combine visual canvases and rich-text documents in one powerful platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## ✨ Features

- 🎨 **Visual Canvas Editor** - Powered by Excalidraw for intuitive diagram creation
- 📝 **Rich Text Editor** - Built with Plate.js for advanced document editing  
- 🔄 **Real-time Collaboration** - Work together seamlessly
- 📁 **Project Management** - Organize canvases and documents into projects
- 🌙 **Dark Mode** - Beautiful themes for day and night
- 💾 **Auto-save** - Never lose your work with intelligent auto-saving
- 📦 **Export/Import** - Download your work as ZIP files
- 🔍 **Library System** - Access official Excalidraw libraries
- 🔒 **Authentication** - Secure user management with Stack Auth
- 📱 **PWA Support** - Install as a desktop/mobile app

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/pnpm/bun
- A Turso database (or other LibSQL compatible database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/appedme/sketchflow.git
   cd sketchflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables in `.env.local`:
   ```env
   # Database (Turso)
   TURSO_DATABASE_URL=your_database_url
   TURSO_AUTH_TOKEN=your_auth_token

   # Authentication (Stack Auth)
   NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_key
   STACK_SECRET_SERVER_KEY=your_secret

   # Optional: Image APIs
   PEXELS_API_KEY=your_pexels_api_key
   IMGBB_API_KEY=your_imgbb_key
   FREEIMAGE_API_KEY=your_freeimage_key
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- [Features Documentation](./docs/)
- [API Documentation](./docs/backend.md)
- [Database Schema](./docs/d1-drizzle.md)
- [Performance Optimization](./docs/PERFORMANCE_OPTIMIZATION_SUMMARY.md)
- [Autosave & Library Features](./docs/AUTOSAVE_AND_LIBRARY_FEATURES.md)
- [Export & Download](./docs/EXPORT_AND_DOWNLOAD_FEATURES.md)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui + Radix UI
- **Canvas Editor**: Excalidraw
- **Rich Text Editor**: Plate.js
- **State Management**: Zustand
- **Data Fetching**: SWR

### Backend
- **Database**: Turso (LibSQL)
- **ORM**: Drizzle
- **Authentication**: Stack Auth
- **File Storage**: ImgBB / FreeImage API
- **Image Search**: Pexels API

### Deployment
- **Platform**: Cloudflare Pages (via OpenNext)
- **Alternative**: Vercel, Netlify

## 📁 Project Structure

```
sketchflow/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── canvas/      # Canvas-related components
│   │   ├── editor/      # Document editor components
│   │   ├── workspace/   # Workspace UI components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and configurations
│   │   ├── actions/     # Server actions
│   │   ├── db/          # Database schema and config
│   │   └── stores/      # Zustand stores
│   ├── hooks/           # Custom React hooks
│   └── styles/          # Global styles
├── public/              # Static assets
├── docs/                # Documentation
└── migrations/          # Database migrations
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations
```

## 🐛 Known Issues

See [GitHub Issues](https://github.com/appedme/sketchflow/issues) for a list of known bugs and feature requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Excalidraw](https://excalidraw.com/) - Amazing open-source drawing tool
- [Plate.js](https://platejs.org/) - Powerful rich-text editor framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Turso](https://turso.tech/) - Fast, edge-hosted database
- [Stack Auth](https://stack-auth.com/) - Modern authentication solution

## 🔗 Links

- **Website**: [https://sketchflow.space](https://sketchflow.space)
- **Documentation**: [https://docs.sketchflow.space](https://sketchflow.space)
- **GitHub**: [https://github.com/appedme/sketchflow](https://github.com/appedme/sketchflow)
- **Issues**: [https://github.com/appedme/sketchflow/issues](https://github.com/appedme/sketchflow/issues)

## 💬 Support

- Open an [issue](https://github.com/appedme/sketchflow/issues)
- Join our [Discord community](https://discord.gg/sketchflow) (coming soon)
- Follow us on [Twitter](https://twitter.com/sketchflow) (coming soon)

---

**Made with ❤️ by the SketchFlow team**

