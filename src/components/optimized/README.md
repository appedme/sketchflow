# Performance Optimization Components

This directory contains optimized components designed to improve the loading performance of heavy JavaScript and CSS bundles, particularly for the Excalidraw canvas and Plate document editor.

## Components

### LazyExcalidrawCanvas.tsx
- **Purpose**: Lazy loads the Excalidraw canvas with enhanced error handling and loading states
- **Features**:
  - Progressive loading with visual feedback
  - Error boundary with retry functionality
  - Optimized bundle splitting
  - Graceful fallbacks

### LazyPlateEditor.tsx
- **Purpose**: Lazy loads the Plate document editor with performance optimizations
- **Features**:
  - Staged loading with progress indication
  - Error recovery mechanisms
  - Memory-efficient loading
  - Enhanced user feedback

### PreloadManager.tsx
- **Purpose**: Intelligent preloading of heavy components based on user behavior
- **Features**:
  - Idle-time preloading
  - Route-based preloading
  - Hover-triggered preloading
  - Memory management

### PerformanceMonitor.tsx
- **Purpose**: Development tool for monitoring Core Web Vitals and component performance
- **Features**:
  - LCP, FID, CLS monitoring
  - Bundle load time tracking
  - Component render time measurement
  - Development-only execution

## Usage

### Basic Implementation
```tsx
// Replace direct imports with lazy versions
import { LazyExcalidrawCanvas } from '@/components/optimized/LazyExcalidrawCanvas';
import { LazyPlateEditor } from '@/components/optimized/LazyPlateEditor';

// Use in your components
<LazyExcalidrawCanvas projectId={id} projectName={name} />
<LazyPlateEditor documentId={docId} projectId={id} />
```

### Preloading Strategy
```tsx
import { useComponentPreloader } from '@/components/optimized/PreloadManager';

function MyComponent() {
  const { preloadOnHover, preloadOnIdle } = useComponentPreloader();
  
  return (
    <button 
      onMouseEnter={() => preloadOnHover('canvas')}
      onClick={() => navigateToCanvas()}
    >
      Open Canvas
    </button>
  );
}
```

## Performance Benefits

1. **Reduced Initial Bundle Size**: Heavy components are loaded only when needed
2. **Faster Time to Interactive**: Critical path is not blocked by large dependencies
3. **Better User Experience**: Progressive loading with visual feedback
4. **Intelligent Caching**: Components are preloaded based on user behavior
5. **Error Resilience**: Graceful handling of loading failures

## Bundle Splitting Strategy

The Next.js configuration has been optimized to create separate chunks for:
- `excalidraw`: All Excalidraw-related code (~2MB)
- `plate-editor`: All Plate editor plugins and components (~1.5MB)
- `radix-ui`: UI component library (~800KB)

This ensures that users only download what they need when they need it.

## Monitoring

In development mode, the PerformanceMonitor component will log:
- Core Web Vitals (LCP, FID, CLS)
- Bundle loading times
- Component render performance
- Memory usage patterns

## Best Practices

1. **Always use lazy components** for heavy editors
2. **Implement preloading** for frequently accessed components
3. **Monitor performance** during development
4. **Test on slow networks** to validate improvements
5. **Use error boundaries** for graceful degradation