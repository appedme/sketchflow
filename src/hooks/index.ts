// Barrel export for all hooks - use this for clean imports
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
