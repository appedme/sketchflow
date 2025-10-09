# Developer Quick Start Guide

Welcome to SketchFlow development! This guide will get you up and running in minutes.

## Prerequisites

- Node.js 18+ installed
- npm/pnpm/bun package manager
- Git
- A code editor (VS Code recommended)

## 🚀 Setup (5 minutes)

### 1. Clone & Install
```bash
git clone https://github.com/appedme/sketchflow.git
cd sketchflow
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Required: Database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token_here

# Required: Authentication  
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_key
STACK_SECRET_SERVER_KEY=your_secret

# Optional: Image features
PEXELS_API_KEY=your_pexels_key
IMGBB_API_KEY=your_imgbb_key
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure (The Essentials)

```
sketchflow/
├── src/app/                    # Next.js routes & API
│   ├── api/                   # Backend endpoints
│   ├── workspace/[id]/        # Workspace page
│   └── dashboard/             # Projects list
│
├── src/components/             # React components
│   ├── canvas/                # Excalidraw components
│   │   ├── CanvasEditor.tsx  # Main canvas
│   │   └── LibraryPanel.tsx  # Library sidebar
│   ├── editor/                # Plate.js components
│   │   └── plate-editor.tsx  # Main editor
│   ├── workspace/             # Workspace UI
│   │   ├── WorkspaceHeader.tsx
│   │   └── UnifiedWorkspace.tsx
│   └── ui/                    # shadcn/ui components
│
├── src/lib/                    # Core logic
│   ├── actions/               # Server actions
│   ├── db/                    # Database
│   │   ├── schema.ts         # DB schema
│   │   └── connection.ts     # DB client
│   └── stores/                # Zustand stores
│       └── useWorkspaceStore.ts
│
└── src/hooks/                  # Custom hooks
```

## 🛠️ Common Development Tasks

### Add a New Feature

1. **Create component**:
   ```bash
   # For canvas features
   touch src/components/canvas/MyFeature.tsx
   
   # For editor features  
   touch src/components/editor/MyFeature.tsx
   ```

2. **Create API endpoint** (if needed):
   ```bash
   mkdir -p src/app/api/my-feature
   touch src/app/api/my-feature/route.ts
   ```

3. **Update database schema** (if needed):
   ```typescript
   // src/lib/db/schema.ts
   export const myTable = sqliteTable('my_table', {
     id: text('id').primaryKey(),
     // ... fields
   });
   ```

4. **Generate migration**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

### Work with Canvas

```typescript
// src/components/canvas/CanvasEditor.tsx
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

const handleCanvasChange = (elements, appState, files) => {
  // Your logic here
  console.log('Canvas changed:', { elements, appState, files });
};
```

### Work with Document Editor

```typescript
// Using Plate.js
import { usePlateEditor } from 'platejs/react';

const editor = usePlateEditor({
  plugins: EditorKit,
  value: initialContent,
  onChange: ({ value }) => {
    console.log('Editor changed:', value);
  },
});
```

### Add Database Query

```typescript
// src/lib/actions/my-action.ts
"use server";

import { getDb } from '@/lib/db/connection';
import { myTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getMyData(id: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(myTable)
    .where(eq(myTable.id, id))
    .limit(1);
  return result[0];
}
```

### Create API Route

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/actions/auth';

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your logic here
  return NextResponse.json({ data: 'success' });
}
```

## 🎨 Styling Guidelines

We use Tailwind CSS with shadcn/ui:

```tsx
// Good - Use Tailwind classes
<div className="flex items-center gap-2 p-4 rounded-lg border">
  <Button variant="outline" size="sm">Click me</Button>
</div>

// Good - Use cn() for conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes"
)}>
```

## 🧪 Testing

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format (if configured)
npm run format
```

## 🔍 Debugging Tips

### Enable Debug Logging
```typescript
// Add to component
useEffect(() => {
  console.log('Component state:', { 
    prop1, prop2, state 
  });
}, [prop1, prop2, state]);
```

### Database Debugging
```bash
# Open Drizzle Studio
npm run db:studio
```

### API Debugging
```typescript
// src/app/api/my-endpoint/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log('Received:', body);  // Check server console
  
  // ... rest of code
}
```

## 📝 Code Style

### TypeScript
```typescript
// Use interfaces for props
interface MyComponentProps {
  title: string;
  isActive?: boolean;
  onSave: (data: any) => void;
}

// Use functional components
export function MyComponent({ title, isActive = false, onSave }: MyComponentProps) {
  // Component code
}
```

### React Hooks
```typescript
// Custom hooks start with 'use'
export function useMyFeature() {
  const [state, setState] = useState<MyType>(initialValue);
  
  const doSomething = useCallback(() => {
    // Logic
  }, [dependencies]);
  
  return { state, doSomething };
}
```

### Server Actions
```typescript
// Always use "use server" directive
"use server";

export async function myServerAction(formData: FormData) {
  // Validate user
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // Do work
  // ...
  
  // Redirect or return
  redirect('/dashboard');
}
```

## 🐛 Common Issues & Solutions

### Issue: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Issue: Database connection failed
```bash
# Check environment variables
cat .env.local

# Test database connection
npm run db:studio
```

### Issue: Type errors
```bash
# Regenerate types
npm run db:generate

# Check TypeScript
npx tsc --noEmit
```

### Issue: Styles not applying
```bash
# Rebuild Tailwind
npm run dev

# Check if component is client-side
# Add "use client" if using hooks
```

## 📚 Key Dependencies

- **Next.js 15**: App router, server actions
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Excalidraw**: Canvas editor
- **Plate.js**: Rich text editor
- **Drizzle**: ORM
- **Turso**: Database
- **Stack Auth**: Authentication
- **Zustand**: State management
- **SWR**: Data fetching

## 🚢 Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Build successful (`npm run build`)
- [ ] Preview working locally
- [ ] Security review done

## 🔗 Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:push            # Push schema changes
npm run db:generate        # Generate migrations
npm run db:studio          # Open Drizzle Studio

# Code Quality
npm run lint               # Run ESLint
npx tsc --noEmit          # Type check

# Git
git status                 # Check status
git add .                  # Stage changes
git commit -m "message"    # Commit
git push                   # Push to remote
```

## 💡 Pro Tips

1. **Hot Reload**: Save files to see changes instantly
2. **Component Inspector**: Use React DevTools browser extension
3. **Network Tab**: Monitor API calls in browser DevTools
4. **Console Logs**: Add strategic console.logs for debugging
5. **Drizzle Studio**: Visual database browser at `localhost:4983`
6. **Stack Auth Dashboard**: Manage users and auth settings
7. **Turso CLI**: Manage database from terminal

## 🤝 Getting Help

1. **Check Documentation**: See `/docs` folder
2. **Search Issues**: GitHub issues for known problems
3. **Ask in Discussions**: GitHub discussions for questions
4. **Read Code**: Look at similar components for examples

## 📖 Next Steps

1. Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
3. Explore [docs/](./docs/) for feature documentation
4. Join our community (Discord coming soon)

---

**Happy coding! 🎉**

Need help? Open an issue or discussion on GitHub.
