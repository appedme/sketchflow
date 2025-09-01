#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating import statements...\n');

const projectRoot = path.join(__dirname, '..');

// Import mapping for reorganized hooks
const hookImportMap = {
    // Workspace hooks
    'useProjectState': '@/hooks/workspace/useProjectState',
    'useProjects': '@/hooks/workspace/useProjects', 
    'useProjectStats': '@/hooks/workspace/useProjectStats',
    'useAutoSave': '@/hooks/workspace/useAutoSave',
    'useDocumentAutoSave': '@/hooks/workspace/useDocumentAutoSave',
    'useCanvasSync': '@/hooks/workspace/useCanvasSync',
    'useViewTracking': '@/hooks/workspace/useViewTracking',
    
    // File hooks
    'useCache': '@/hooks/files/useCache',
    'useCachedApi': '@/hooks/files/useCachedApi',
    'useImageUpload': '@/hooks/files/useImageUpload',
    'use-upload-file': '@/hooks/files/use-upload-file',
    
    // Canvas hooks
    'useExcalidrawExport': '@/hooks/canvas/useExcalidrawExport',
    
    // Shared hooks
    'use-debounce': '@/hooks/shared/use-debounce',
    'use-is-touch-device': '@/hooks/shared/use-is-touch-device',
    'use-mobile': '@/hooks/shared/use-mobile',
    'use-mounted': '@/hooks/shared/use-mounted',
    'useApi': '@/hooks/shared/useApi',
    'useSWROptimized': '@/hooks/shared/useSWROptimized'
};

// Function to update imports in a file
function updateImportsInFile(filePath) {
    if (!fs.existsSync(filePath) || !filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
        return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Update hook imports
    Object.keys(hookImportMap).forEach(hookName => {
        const oldPattern = new RegExp(`from ['"]@/hooks/${hookName}['"]`, 'g');
        const newImport = `from '${hookImportMap[hookName]}'`;
        
        if (oldPattern.test(content)) {
            content = content.replace(oldPattern, newImport);
            updated = true;
        }
    });
    
    // Update component imports to use index files
    const componentImportUpdates = [
        {
            pattern: /from ['"]@\/components\/workspace\/([^'"]+)['"]/g,
            replacement: "from '@/components/workspace'"
        },
        {
            pattern: /from ['"]@\/components\/dashboard\/([^'"]+)['"]/g,
            replacement: "from '@/components/dashboard'"
        },
        {
            pattern: /from ['"]@\/components\/canvas\/([^'"]+)['"]/g,
            replacement: "from '@/components/canvas'"
        },
        {
            pattern: /from ['"]@\/components\/landing\/([^'"]+)['"]/g,
            replacement: "from '@/components/landing'"
        }
    ];
    
    componentImportUpdates.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            updated = true;
        }
    });
    
    if (updated) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    
    return false;
}

// Function to recursively find and update files
function updateFilesInDirectory(dir) {
    let updatedCount = 0;
    
    if (!fs.existsSync(dir)) return updatedCount;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            updatedCount += updateFilesInDirectory(itemPath);
        } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
            if (updateImportsInFile(itemPath)) {
                console.log(`✅ Updated imports in: ${path.relative(projectRoot, itemPath)}`);
                updatedCount++;
            }
        }
    });
    
    return updatedCount;
}

// Update all files in src directory
const updatedFiles = updateFilesInDirectory(path.join(projectRoot, 'src'));

console.log(`\n✅ Updated imports in ${updatedFiles} files`);

// Create a comprehensive barrel export for hooks
const hooksBarrelExport = `// Barrel export for all hooks - use this for clean imports
// Example: import { useProjectState, useDebounce } from '@/hooks';

// Workspace hooks
export { useProjectState } from './workspace/useProjectState';
export { useProjects } from './workspace/useProjects';
export { useProjectStats } from './workspace/useProjectStats';
export { useAutoSave } from './workspace/useAutoSave';
export { useDocumentAutoSave } from './workspace/useDocumentAutoSave';
export { useCanvasSync } from './workspace/useCanvasSync';
export { useViewTracking } from './workspace/useViewTracking';

// File hooks
export { useCache } from './files/useCache';
export { useCachedApi } from './files/useCachedApi';
export { useImageUpload } from './files/useImageUpload';
export { useUploadFile } from './files/use-upload-file';

// Canvas hooks
export { useExcalidrawExport } from './canvas/useExcalidrawExport';

// Shared hooks
export { useDebounce } from './shared/use-debounce';
export { useIsTouchDevice } from './shared/use-is-touch-device';
export { useMobile } from './shared/use-mobile';
export { useMounted } from './shared/use-mounted';
export { useApi } from './shared/useApi';
export { useSWROptimized } from './shared/useSWROptimized';
`;

fs.writeFileSync(path.join(projectRoot, 'src/hooks/index.ts'), hooksBarrelExport);
console.log('✅ Updated hooks barrel export');

console.log('\n🎉 Import updates complete!');
console.log('📋 All imports have been updated to use the new organized structure');
console.log('🚀 The codebase now has clean, maintainable imports!');