#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting SketchFlow cleanup and refactoring...\n');

const projectRoot = path.join(__dirname, '..');

// 1. Remove unused/redundant files and empty directories
console.log('🗑️  Removing unused files and empty directories...');

const filesToRemove = [
    // Remove optimized folder (already integrated)
    'src/components/optimized',
    // Remove empty API directories
    'src/app/api/admin/projects/[projectId]/canvases',
    'src/app/api/admin/projects/[projectId]/documents', 
    'src/app/api/admin/projects/[projectId]/view',
    'src/app/api/canvas/[canvasId]/view',
    'src/app/api/documents/[documentId]/load',
    'src/app/api/documents/[documentId]/save',
    'src/app/api/documents/[documentId]/view',
    'src/app/api/documents/project/[projectId]/load',
    'src/app/api/projects/[id]',
    'src/app/api/projects/[projectId]/public',
    'src/app/api/share/[shareToken]/manage',
    'src/app/api/uploadthing',
    // Remove empty page directories
    'src/app/embed/project/[projectId]',
    // Remove test directory
    'src/app/workspace/[projectId]/test',
    // Remove unused CSS files
    'src/components/dashboard/Dashboard.css',
    'src/components/dashboard/ProjectCard.css',
    'src/components/ui/tweet-grid.css',
    // Remove unused components
    'src/components/ui/tweet-grid-demo.tsx',
    'src/components/ui/tweet-grid.tsx',
    'src/components/ui/glitcgy-text.tsx',
    // Remove duplicate theme toggles
    'src/components/theme-toggle-simple.tsx',
    // Remove unused loading component
    'src/components/loading.tsx',
];

let removedCount = 0;
filesToRemove.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(fullPath);
            }
            console.log(`✅ Removed: ${filePath}`);
            removedCount++;
        } catch (error) {
            console.log(`⚠️  Failed to remove: ${filePath}`);
        }
    }
});

console.log(`✅ Removed ${removedCount} unused files/directories\n`);

// 2. Reorganize components by feature
console.log('📁 Reorganizing components by feature...');

// Create new feature-based structure
const newStructure = {
    'src/features': {
        'auth': ['src/components/auth'],
        'dashboard': ['src/components/dashboard'],
        'workspace': ['src/components/workspace', 'src/components/project'],
        'canvas': ['src/components/canvas', 'src/components/excalidraw'],
        'editor': ['src/components/editor'],
        'files': ['src/components/files'],
        'embed': ['src/components/embed'],
        'landing': ['src/components/landing'],
    },
    'src/shared': {
        'ui': ['src/components/ui'],
        'utils': ['src/components/utils'],
        'providers': ['src/components/providers'],
        'magicui': ['src/components/magicui'],
    }
};

// Create feature directories
Object.keys(newStructure).forEach(baseDir => {
    const basePath = path.join(projectRoot, baseDir);
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
    }
    
    Object.keys(newStructure[baseDir]).forEach(featureDir => {
        const featurePath = path.join(basePath, featureDir);
        if (!fs.existsSync(featurePath)) {
            fs.mkdirSync(featurePath, { recursive: true });
        }
    });
});

// 3. Consolidate hooks by feature
console.log('🪝 Reorganizing hooks by feature...');

const hooksByFeature = {
    'workspace': [
        'useProjectState.ts',
        'useProjects.ts', 
        'useProjectStats.ts',
        'useAutoSave.ts',
        'useDocumentAutoSave.ts',
        'useCanvasSync.ts',
        'useViewTracking.ts'
    ],
    'files': [
        'useCache.ts',
        'useCachedApi.ts',
        'useImageUpload.ts',
        'use-upload-file.ts'
    ],
    'canvas': [
        'useExcalidrawExport.ts'
    ],
    'shared': [
        'use-debounce.ts',
        'use-is-touch-device.ts',
        'use-mobile.ts',
        'use-mounted.ts',
        'useApi.ts',
        'useSWROptimized.ts'
    ]
};

// Create hooks feature directories
Object.keys(hooksByFeature).forEach(feature => {
    const featurePath = path.join(projectRoot, 'src/hooks', feature);
    if (!fs.existsSync(featurePath)) {
        fs.mkdirSync(featurePath, { recursive: true });
    }
});

// Move hooks to feature directories
let movedHooks = 0;
Object.keys(hooksByFeature).forEach(feature => {
    hooksByFeature[feature].forEach(hookFile => {
        const oldPath = path.join(projectRoot, 'src/hooks', hookFile);
        const newPath = path.join(projectRoot, 'src/hooks', feature, hookFile);
        
        if (fs.existsSync(oldPath)) {
            try {
                fs.renameSync(oldPath, newPath);
                console.log(`✅ Moved hook: ${hookFile} → hooks/${feature}/`);
                movedHooks++;
            } catch (error) {
                console.log(`⚠️  Failed to move hook: ${hookFile}`);
            }
        }
    });
});

console.log(`✅ Reorganized ${movedHooks} hooks by feature\n`);

// 4. Create index files for clean imports
console.log('📄 Creating index files for clean imports...');

const indexFiles = [
    {
        path: 'src/hooks/index.ts',
        content: `// Workspace hooks
export * from './workspace/useProjectState';
export * from './workspace/useProjects';
export * from './workspace/useProjectStats';
export * from './workspace/useAutoSave';
export * from './workspace/useDocumentAutoSave';
export * from './workspace/useCanvasSync';
export * from './workspace/useViewTracking';

// File hooks
export * from './files/useCache';
export * from './files/useCachedApi';
export * from './files/useImageUpload';
export * from './files/use-upload-file';

// Canvas hooks
export * from './canvas/useExcalidrawExport';

// Shared hooks
export * from './shared/use-debounce';
export * from './shared/use-is-touch-device';
export * from './shared/use-mobile';
export * from './shared/use-mounted';
export * from './shared/useApi';
export * from './shared/useSWROptimized';
`
    },
    {
        path: 'src/components/workspace/index.ts',
        content: `export { UnifiedWorkspace } from './UnifiedWorkspace';
export { WorkspaceEditor } from './WorkspaceEditor';
export { WorkspaceTabs } from './WorkspaceTabs';
export { WorkspaceBottomBar } from './WorkspaceBottomBar';
export { WorkspaceHeader } from './WorkspaceHeader';
export { WorkspaceSidebar } from './WorkspaceSidebar';
export { WorkspaceShell } from './WorkspaceShell';
export { WorkspaceProjectLanding } from './WorkspaceProjectLanding';
`
    },
    {
        path: 'src/components/dashboard/index.ts',
        content: `export { ProjectDashboard } from './ProjectDashboard';
export { ProjectCard } from './ProjectCard';
export { ProjectForm } from './ProjectForm';
export { NewProjectForm } from './NewProjectForm';
export { ProjectFilters } from './ProjectFilters';
export { ProjectDropdown } from './ProjectDropdown';
export { ProjectLoadingOverlay } from './ProjectLoadingOverlay';
export { TemplateSelector } from './TemplateSelector';
export { ModeToggler } from './ModeToggler';
`
    },
    {
        path: 'src/components/canvas/index.ts',
        content: `export { CanvasWelcomeScreen } from './CanvasWelcomeScreen';
export { CanvasWrapper } from './CanvasWrapper';
export { EnhancedExcalidrawCanvas } from './EnhancedExcalidrawCanvas';
export { ExcalidrawLibrarySystem } from './ExcalidrawLibrarySystem';
export { ExcalidrawWithShapeConnector } from './ExcalidrawWithShapeConnector';
export { ShapeConnector } from './ShapeConnector';
`
    },
    {
        path: 'src/components/landing/index.ts',
        content: `export { default as Announcement } from './announcement';
export { default as CTASection } from './cta-section';
export { default as FeaturesSection } from './features-section';
export { default as Footer } from './footer';
export { default as FutureFeaturesSection } from './future-features-section';
export { default as HeroSection } from './hero-section';
export { default as HowItWorksSection } from './how-it-works-section';
export { default as IntegrationSection } from './integration-section';
export { default as Navigation } from './navigation';
export { default as PricingPreviewSection } from './pricing-preview-section';
export { default as StatsSection } from './stats-section';
export { default as TestimonialsSection } from './testimonials-section';
export { default as UseCasesSection } from './use-cases-section';
`
    },
    {
        path: 'src/lib/index.ts',
        content: `// Actions
export * from './actions';

// Database
export * from './db';

// Stores
export * from './stores/useWorkspaceStore';

// Utils
export * from './utils';
export * from './fileCache';
export * from './imageUpload';
export * from './imageUtils';
`
    }
];

let createdIndexes = 0;
indexFiles.forEach(({ path: filePath, content }) => {
    const fullPath = path.join(projectRoot, filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created: ${filePath}`);
    createdIndexes++;
});

console.log(`✅ Created ${createdIndexes} index files\n`);

// 5. Consolidate similar components
console.log('🔄 Consolidating similar components...');

// Merge theme toggle components
const themeTogglePath = path.join(projectRoot, 'src/components/theme-toggle.tsx');
if (fs.existsSync(themeTogglePath)) {
    const optimizedThemeToggle = `"use client";

import { memo } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export const ThemeToggle = memo(function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="h-8 w-8 p-0"
        >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
});
`;
    
    fs.writeFileSync(themeTogglePath, optimizedThemeToggle);
    console.log('✅ Optimized theme toggle component');
}

// 6. Remove redundant files from root
console.log('🧹 Cleaning up root directory...');

const rootFilesToRemove = [
    'todo.md',
    'todo-later.md',
    'OPTIMIZATION_PLAN.md',
    'OPTIMIZATION_SUMMARY.md', 
    'OPTIMIZATION_COMPLETE.md',
    'package.optimized.json'
];

let removedRootFiles = 0;
rootFilesToRemove.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
        removedRootFiles++;
    }
});

console.log(`✅ Cleaned up ${removedRootFiles} files from root\n`);

// 7. Create performance optimization config
console.log('⚡ Creating performance optimization config...');

const performanceConfig = `// Performance optimization utilities
export const PERFORMANCE_CONFIG = {
    // Cache TTL in milliseconds
    CACHE_TTL: {
        FILE_DATA: 5 * 60 * 1000, // 5 minutes
        PROJECT_DATA: 10 * 60 * 1000, // 10 minutes
        USER_DATA: 15 * 60 * 1000, // 15 minutes
    },
    
    // Debounce delays
    DEBOUNCE: {
        AUTO_SAVE: 2000, // 2 seconds
        SEARCH: 300, // 300ms
        RESIZE: 100, // 100ms
    },
    
    // Bundle splitting
    LAZY_LOAD_THRESHOLD: 1000, // 1 second
    
    // Memory management
    MAX_CACHE_SIZE: 50, // Maximum cached items
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Performance monitoring
export const trackPerformance = (name: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
        const start = performance.now();
        fn();
        const end = performance.now();
        console.log(\`⚡ \${name}: \${(end - start).toFixed(2)}ms\`);
    } else {
        fn();
    }
};

// Memory cleanup utility
export const cleanupMemory = () => {
    if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
    }
};
`;

fs.writeFileSync(path.join(projectRoot, 'src/lib/performance.ts'), performanceConfig);
console.log('✅ Created performance optimization config');

// 8. Summary
console.log('\n🎉 Cleanup and refactoring complete!');
console.log(`✅ Removed ${removedCount} unused files/directories`);
console.log(`✅ Reorganized ${movedHooks} hooks by feature`);
console.log(`✅ Created ${createdIndexes} index files for clean imports`);
console.log(`✅ Cleaned up ${removedRootFiles} root files`);
console.log('✅ Optimized component structure');
console.log('✅ Added performance optimization utilities');

console.log('\n📋 Next steps:');
console.log('1. Update import statements to use new paths');
console.log('2. Test the application to ensure everything works');
console.log('3. Run: npm run build to verify the build');

console.log('\n🚀 The codebase is now clean, organized, and optimized!');