import { useState, useCallback, useRef, useEffect } from "react";
import { 
  Excalidraw, 
  MainMenu, 
  WelcomeScreen, 
  Sidebar,
  convertToExcalidrawElements,
  serializeAsJSON,
  loadSceneOrLibraryFromBlob,
  exportToCanvas,
  exportToSvg,
  exportToBlob
} from "@excalidraw/excalidraw";
import { 
  ExcalidrawImperativeAPI, 
  ExcalidrawElement, 
  AppState, 
  BinaryFiles,
  LibraryItems 
} from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";

interface ExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  isReadOnly?: boolean;
}

export function ExcalidrawCanvas({ 
  projectId, 
  projectName 
}: ExcalidrawCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<Partial<AppState>>({
    collaborators: new Map(),
    theme: "light",
    viewModeEnabled: false,
    zenModeEnabled: false,
    gridSize: null,
  });
  const [files, setFiles] = useState<BinaryFiles>({});
  const [libraryItems, setLibraryItems] = useState<LibraryItems>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneFileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`excalidraw-${projectId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.elements) {
          setElements(convertToExcalidrawElements(parsed.elements));
        }
        if (parsed.appState) {
          setAppState({
            ...parsed.appState,
            collaborators: new Map(),
          });
        }
        if (parsed.files) {
          setFiles(parsed.files);
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, [projectId]);

  // Load library items on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem(`excalidraw-library-${projectId}`);
    if (savedLibrary) {
      try {
        const parsed = JSON.parse(savedLibrary);
        setLibraryItems(parsed);
      } catch (error) {
        console.error('Failed to load library:', error);
      }
    }
  }, [projectId]);

  // Auto-save functionality
  useEffect(() => {
    if (elements.length > 0 || Object.keys(appState).length > 0) {
      const saveData = {
        elements,
        appState,
        files,
        timestamp: Date.now()
      };
      localStorage.setItem(`excalidraw-${projectId}`, JSON.stringify(saveData));
    }
  }, [elements, appState, files, projectId]);

  const handleChange = useCallback((
    elements: readonly ExcalidrawElement[], 
    appState: AppState,
    files: BinaryFiles
  ) => {
    setElements(elements);
    setAppState(appState);
    setFiles(files);
  }, []);

  const handleLibraryChange = useCallback((libraryItems: LibraryItems) => {
    setLibraryItems(libraryItems);
    // Save library to localStorage
    localStorage.setItem(`excalidraw-library-${projectId}`, JSON.stringify(libraryItems));
  }, [projectId]);

  const resetCanvas = useCallback(() => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
      setElements([]);
      setFiles({});
    }
  }, [excalidrawAPI]);

  const clearCanvas = useCallback(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        elements: [],
      });
      setElements([]);
    }
  }, [excalidrawAPI]);

  const importLibrary = useCallback(async (file: File) => {
    try {
      const blob = await loadSceneOrLibraryFromBlob(file, null, null);
      
      if (blob.type === "excalidrawlib") {
        if (excalidrawAPI && blob.data.libraryItems) {
          // Merge with existing library items
          const mergedLibrary = [...libraryItems, ...blob.data.libraryItems];
          
          excalidrawAPI.updateLibrary({
            libraryItems: mergedLibrary,
            merge: false
          });
          
          setLibraryItems(mergedLibrary);
          alert(`Successfully imported ${blob.data.libraryItems.length} library items!`);
        }
      } else {
        alert('Please select a valid .excalidrawlib file.');
      }
    } catch (error) {
      console.error('Failed to import library:', error);
      alert('Failed to import library. Please check the file format.');
    }
  }, [excalidrawAPI, libraryItems]);

  const importScene = useCallback(async (file: File) => {
    try {
      const blob = await loadSceneOrLibraryFromBlob(file, null, null);
      
      if (blob.type === "excalidraw") {
        if (excalidrawAPI && blob.data) {
          excalidrawAPI.updateScene({
            elements: blob.data.elements || [],
            appState: blob.data.appState || {},
          });
          
          if (blob.data.files) {
            excalidrawAPI.addFiles(Object.values(blob.data.files));
          }
          
          alert('Scene imported successfully!');
        }
      } else {
        alert('Please select a valid .excalidraw file.');
      }
    } catch (error) {
      console.error('Failed to import scene:', error);
      alert('Failed to import scene. Please check the file format.');
    }
  }, [excalidrawAPI]);

  const exportLibrary = useCallback(() => {
    if (libraryItems.length === 0) {
      alert('No library items to export.');
      return;
    }

    const libraryData = {
      type: "excalidrawlib",
      version: 2,
      library: libraryItems
    };

    const blob = new Blob([JSON.stringify(libraryData, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}-library.excalidrawlib`;
    link.click();
    URL.revokeObjectURL(url);
  }, [libraryItems, projectName]);

  const saveScene = useCallback(() => {
    if (!excalidrawAPI) return;
    
    const sceneData = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();
    
    const exportData = {
      type: "excalidraw",
      version: 2,
      source: "https://sketchflow.space",
      elements: sceneData,
      appState,
      files
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}.excalidraw`;
    link.click();
    URL.revokeObjectURL(url);
  }, [excalidrawAPI, projectName]);

  const handleLibraryFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importLibrary(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [importLibrary]);

  const handleSceneFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importScene(file);
      if (sceneFileInputRef.current) {
        sceneFileInputRef.current.value = '';
      }
    }
  }, [importScene]);

  const triggerLibraryImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const triggerSceneImport = useCallback(() => {
    sceneFileInputRef.current?.click();
  }, []);

  return (
    <div className="h-full w-full">
      <Excalidraw
        ref={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
        onChange={handleChange}
        onLibraryChange={handleLibraryChange}
        initialData={{
          elements,
          appState: {
            ...appState,
            collaborators: new Map(),
          },
          files,
          libraryItems
        }}
      >
        <MainMenu>
          <MainMenu.Item onSelect={triggerSceneImport}>
            Load Scene
          </MainMenu.Item>
          <MainMenu.Item onSelect={saveScene}>
            Save Scene
          </MainMenu.Item>
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas onSelect={clearCanvas} />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          <MainMenu.Separator />
          <MainMenu.Item onSelect={triggerLibraryImport}>
            Import Library
          </MainMenu.Item>
          <MainMenu.Item onSelect={exportLibrary}>
            Export Library
          </MainMenu.Item>
          <MainMenu.Separator />
          <MainMenu.DefaultItems.Help />
        </MainMenu>
        
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo />
            <WelcomeScreen.Center.Heading>
              Welcome to {projectName}
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemLoadScene />
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>

        <Sidebar name="library">
          <Sidebar.Header>
            <div className="flex items-center justify-between p-2">
              <span className="font-medium">Library ({libraryItems.length})</span>
              <div className="flex gap-1">
                <button 
                  onClick={triggerLibraryImport}
                  className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50"
                  title="Import library file"
                >
                  Import
                </button>
                <button 
                  onClick={exportLibrary}
                  className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded hover:bg-green-50"
                  title="Export library"
                  disabled={libraryItems.length === 0}
                >
                  Export
                </button>
              </div>
            </div>
          </Sidebar.Header>
          <div className="p-2">
            {libraryItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">Library</div>
                <div className="text-sm">No library items yet</div>
                <div className="text-xs mt-1 mb-3">Import .excalidrawlib files or add items from the canvas</div>
                <button 
                  onClick={triggerLibraryImport}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Import Library
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-600 mb-2">
                  Click on any item to add it to the canvas
                </div>
                {libraryItems.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (excalidrawAPI && item.elements) {
                        excalidrawAPI.addElementsFromLibrary(item.elements);
                      }
                    }}
                  >
                    <div className="text-xs text-gray-600">
                      Library Item {index + 1}
                    </div>
                    {item.elements && (
                      <div className="text-xs text-gray-400">
                        {item.elements.length} element(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Sidebar>
      </Excalidraw>
      
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".excalidrawlib"
        style={{ display: 'none' }}
        onChange={handleLibraryFileImport}
      />
      <input
        ref={sceneFileInputRef}
        type="file"
        accept=".excalidraw"
        style={{ display: 'none' }}
        onChange={handleSceneFileImport}
      />
    </div>
  );
}