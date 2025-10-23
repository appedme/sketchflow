# Testing the Library Panel

## How to Access the Library Panel

1. **Open a Canvas**
   - Navigate to `/workspace/{id}` 
   - Click on any canvas file (or the one that's already open)

2. **Open the Library Sidebar**
   - Look for the **sidebar icon** in the Excalidraw toolbar (top right area)
   - Click on it to reveal the sidebar options
   - Select **"Community Libraries"** 

3. **Browse Libraries**
   - The panel will load libraries from `https://libraries.excalidraw.com/libraries.json`
   - You'll see a search bar at the top
   - Libraries are displayed in a scrollable grid

4. **Search for Libraries**
   - Type in the search box (e.g., "icons", "flowchart", "aws")
   - Results filter in real-time by name, description, and tags
   - Clear search with the X button

5. **Import a Library**
   - Click on any library card
   - The library will be imported automatically
   - Access the imported items from Excalidraw's default library panel
   - Drag and drop items onto your canvas

## What You Should See

### Sidebar Panel Structure:
```
┌─────────────────────────────────┐
│  Community Libraries         ✕  │ <- Header
├─────────────────────────────────┤
│  🔍 Search libraries...         │ <- Search bar
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Library Name       📥     │  │ <- Library card
│  │ Description text...       │  │
│  │ [tag1] [tag2]            │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Another Library    📥     │  │
│  │ Description...            │  │
│  └───────────────────────────┘  │
│                                 │
│  ... (scrollable)               │
├─────────────────────────────────┤
│  From Excalidraw Community      │ <- Footer
└─────────────────────────────────┘
```

## Expected Behavior

### ✅ Working Features:
- [x] Sidebar appears when clicked
- [x] Libraries load from API
- [x] Search filters instantly
- [x] Infinite scroll (loads 20 at a time)
- [x] Click to import library
- [x] Imported items appear in default library
- [x] Can use imported items on canvas

### 🎯 Test Cases:

1. **Load Libraries**
   - Open sidebar
   - Should see loading spinner briefly
   - Then see list of libraries

2. **Search Test**
   - Type "icons" → Should show icon libraries
   - Type "flowchart" → Should show flowchart libraries
   - Type "aws" → Should show AWS libraries
   - Clear search → Should show all again

3. **Import Test**
   - Click a library card
   - Check browser console → Should see "Successfully loaded library: [name]"
   - Open Excalidraw's default library
   - Should see new items

4. **Infinite Scroll Test**
   - Scroll down in the library list
   - After ~15-18 items, should load more
   - Counter should update: "Showing 40 of 150"

5. **Error Handling Test**
   - Disconnect internet
   - Try to load libraries
   - Should see error message

## Troubleshooting

### Sidebar Not Appearing
**Issue**: Can't see the sidebar button
- **Fix**: Make sure you're not in read-only mode
- **Fix**: Check that it's not a public/shared canvas

### Libraries Not Loading  
**Issue**: Sidebar is empty or shows error
- **Check**: Network tab in DevTools for failed requests
- **Check**: Console for error messages
- **URL**: Verify `https://libraries.excalidraw.com/libraries.json` is accessible

### Import Not Working
**Issue**: Click library but nothing happens
- **Check**: Console for "Excalidraw API not available" message
- **Fix**: Wait for canvas to fully load before importing
- **Check**: Excalidraw's default library to see if items are there

### Search Not Working
**Issue**: Typing doesn't filter results
- **Clear**: Clear search and try again
- **Check**: Try exact library names first
- **Case**: Search is case-insensitive

## Visual Reference

### The sidebar should look like this:

**Header Bar:**
- Title: "Community Libraries"
- Close button (X)

**Search Section:**
- Search icon on left
- Input field: "Search libraries..."
- Clear button (X) appears when typing

**Library Cards:**
- Library name (bold, small text)
- Description (2 lines max)
- Tags (max 2 shown, +N for more)
- Download icon on right
- Hover effect (background color change)

**Footer:**
- Link to Excalidraw Community

## Console Messages

When working correctly, you should see:
```
✓ Libraries fetched successfully
✓ Filtered libraries: X results  
✓ Successfully loaded library: [Library Name]
```

When there are errors:
```
✗ Error fetching libraries: [error message]
✗ Excalidraw API not available
✗ Failed to load library content
```

## Next Steps After Successful Import

1. Close the Community Libraries sidebar
2. Open Excalidraw's default library panel
3. See your imported items
4. Drag items onto canvas
5. Start creating!

---

**Current Status**: ✅ Implemented
**Location**: `/workspace/{id}` canvas view
**Sidebar Name**: "Community Libraries"
