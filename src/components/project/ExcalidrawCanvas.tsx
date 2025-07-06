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
import type { 
  ExcalidrawImperativeAPI, 
  AppState, 
  BinaryFiles,
  LibraryItems 
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import "../../styles/excalidraw-custom.css";

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
    gridSize: undefined,
    name: projectName,
    currentItemStrokeColor: "#1e40af",
    currentItemBackgroundColor: "#dbeafe",
    currentItemFillStyle: "hachure",
    currentItemStrokeWidth: 2,
    currentItemRoughness: 1,
    currentItemOpacity: 100,
    currentItemFontFamily: 1,
    currentItemFontSize: 20,
    currentItemTextAlign: "left",
    currentItemStartArrowhead: null,
    currentItemEndArrowhead: "arrow",
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
      
      if (blob.type === "application/vnd.excalidrawlib+json") {
        if (excalidrawAPI && blob.data.libraryItems) {
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
      
      if (blob.type === "application/vnd.excalidraw+json") {
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
    <div className="h-full w-full relative">
      <Excalidraw
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
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
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: false,
            saveToActiveFile: false,
            toggleTheme: false,
            clearCanvas: false,
          },
          tools: {
            image: true,
          },
          dockedSidebarBreakpoint: 0, // Always show sidebar
        }}
        langCode="en"
        gridModeEnabled={false}
        theme="light"
        name={`SketchFlow - ${projectName}`}
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
          <MainMenu.Item onSelect={clearCanvas}>
            Clear Canvas
          </MainMenu.Item>
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
          <MainMenu.Item onSelect={() => window.open('https://sketchflow.space/help', '_blank')}>
            SketchFlow Help
          </MainMenu.Item>
        </MainMenu>
        
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <div className="flex flex-col items-center">
              <div className="mb-6">
                {/* <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L21 21M3 21L21 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 8L16 12L12 16L8 12L12 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div> */}
                <h1 className="text-3xl font-bold text-gray-900 text-center">SketchFlow</h1>
                <p className="text-gray-600 text-center mt-2">Document your ideas visually</p>
              </div>
{/*               
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                <h2 className="text-xl font-semibold text-blue-900 mb-1">{projectName}</h2>
                <p className="text-blue-700 text-sm">Start sketching your ideas</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={triggerSceneImport}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  Load Scene
                </button>
                <button 
                  onClick={triggerLibraryImport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                >
                  Import Library
                </button>
              </div> */}
              
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm mb-2">Quick Tips:</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Press R for rectangle, C for circle</p>
                  <p>Hold Shift to maintain proportions</p>
                  <p>Use Ctrl+Z to undo</p>
                </div>
              </div>
            </div>
          </WelcomeScreen.Center>
        </WelcomeScreen>

        <Sidebar name="library">
          <Sidebar.Header>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">Library</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {libraryItems.length}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={triggerLibraryImport}
                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                    title="Import library file"
                  >
                    Import
                  </button>
                  <button 
                    onClick={exportLibrary}
                    className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded-md hover:bg-purple-100 transition-colors"
                    title="Export library"
                    disabled={libraryItems.length === 0}
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          </Sidebar.Header>
          <div className="p-3">
            {libraryItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No library items yet</h3>
                <p className="text-sm text-gray-600 mb-4">Import .excalidrawlib files or create your own library items</p>
                <button 
                  onClick={triggerLibraryImport}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                >
                  Import Library
                </button>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> Select elements on the canvas and add them to your library for reuse!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Click any item to add to canvas</p>
                  <button 
                    onClick={() => {
                      if (confirm('Clear all library items?')) {
                        setLibraryItems([]);
                        localStorage.removeItem(`excalidraw-library-${projectId}`);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {libraryItems.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className="group p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                      onClick={() => {
                        if (excalidrawAPI && item.elements) {
                          excalidrawAPI.updateScene({
                            elements: [...elements, ...item.elements],
                          });
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-800 group-hover:text-blue-800">
                            Item {index + 1}
                          </div>
                          {item.elements && (
                            <div className="text-xs text-gray-500">
                              {item.elements.length} element{item.elements.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="text-blue-500 group-hover:text-blue-700">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Sidebar>
      </Excalidraw>
      
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