# OpenMoji Integration Documentation

## Overview
This document describes how OpenMoji was integrated into the Excalidraw canvas application to provide emoji support.

## Implementation Details

### 1. OpenMoji Service (`src/lib/services/openmoji.ts`)
- Created a singleton service class `OpenMojiService` to manage emoji data
- Fetched emoji data from OpenMoji's official API
- Implemented search functionality with category filtering
- Cached emoji data for performance

### 2. OpenMoji Sidebar Component (`src/components/canvas/OpenMojiSidebar.tsx`)
- Created a sidebar component integrated with Excalidraw's sidebar system
- Implemented search functionality with real-time filtering
- Added category-based browsing (People, Nature, Objects, etc.)
- Provided emoji preview and selection interface

### 3. Integration with ExcalidrawCanvas
- Added OpenMoji sidebar to the main canvas component
- Integrated with Excalidraw's sidebar system using the `<Sidebar>` component
- Added emoji selection handler that converts emojis to text elements on the canvas
- Used `convertToExcalidrawElements` to properly format emoji text elements

### 4. Key Features Implemented
- **Search**: Real-time emoji search by name and keywords
- **Categories**: Browse emojis by category (People, Nature, Objects, etc.)
- **Canvas Integration**: Click to add emojis directly to the canvas
- **Performance**: Lazy loading and caching of emoji data
- **UI/UX**: Clean, responsive sidebar interface

### 5. Technical Implementation
```typescript
// Service instantiation
const openMojiService = useMemo(() => OpenMojiService.getInstance(), []);

// Sidebar integration
<Sidebar name="openmoji" tab="openmoji">
  <OpenMojiSidebar
    isOpen={isOpenMojiSidebarOpen}
    onClose={() => setIsOpenMojiSidebarOpen(false)}
    onEmojiSelect={(emoji: OpenMojiIcon) => {
      // Convert emoji to Excalidraw text element
      const newElement = {
        type: "text" as const,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        text: emoji.emoji,
        fontSize: 40,
        fontFamily: 1,
        textAlign: "center" as const,
        verticalAlign: "middle" as const,
      };
      
      const elements = convertToExcalidrawElements([newElement]);
      excalidrawAPIRef.current.updateScene({
        elements: [...(excalidrawAPIRef.current.getSceneElements() || []), ...elements],
      });
    }}
  />
</Sidebar>
```

### 6. Files Involved
- `src/lib/services/openmoji.ts` - Core service
- `src/components/canvas/OpenMojiSidebar.tsx` - UI component
- `src/components/project/ExcalidrawCanvas.tsx` - Integration point

### 7. Dependencies
- OpenMoji API for emoji data
- Excalidraw's sidebar system
- React hooks for state management
- Tailwind CSS for styling

## Removal Process
To remove OpenMoji integration:
1. Delete `src/lib/services/openmoji.ts`
2. Delete `src/components/canvas/OpenMojiSidebar.tsx`
3. Remove OpenMoji imports and sidebar from `ExcalidrawCanvas.tsx`
4. Remove any OpenMoji-related state and handlers