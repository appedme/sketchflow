import { useState, useCallback } from "react";
import { Excalidraw, MainMenu, WelcomeScreen, Sidebar } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface ExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  isReadOnly?: boolean;
}
// when I click on library and try to add a library item, I'm being rediredt to https://libraries.excalidraw.com/?target=_blank&referrer=http%3A%2F%2Flocalhost%3A3000%2Fproject%2Fctb1dhjni&useHash=true&token=MPR0jRGLClP-YoPed_7jy&theme=light&version=2&sort=default and I click on add library but its not adding the library item to the excalidraw canvas. I want to be able to add library items to the excalidraw canvas from the library panel. I also want to be able to import .excalidrawlib files into the library panel and have them show up in the library panel. I also want to be able to reset the canvas and clear all elements from the canvas. see https://github.com/excalidraw/excalidraw/tree/master/examples/with-nextjs each file in the folder for understanding excalidraw integration with nextjs. I also want to be able to import .excalidrawlib files into the library panel and have them show up in the library panel. I also want to be able to reset the canvas and clear all elements from the canvas. see
export function ExcalidrawCanvas({ 
  projectId, 
  projectName 
}: ExcalidrawCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [libraryItems, setLibraryItems] = useState([]);

  const handleChange = useCallback((elements: any, appState: any) => {
    // Handle changes to elements and app state
    console.log('Canvas changed:', { elements: elements.length, appState });
  }, []);

  const handleLibraryChange = useCallback((items: any) => {
    setLibraryItems(items);
    console.log('Library changed:', items);
  }, []);

  const resetCanvas = useCallback(() => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
    }
  }, [excalidrawAPI]);

  const importLibrary = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const libraryData = JSON.parse(text);
      
      if (libraryData.library && Array.isArray(libraryData.library)) {
        if (excalidrawAPI) {
          excalidrawAPI.updateLibrary({
            libraryItems: libraryData.library,
            merge: true
          });
        }
      }
    } catch (error) {
      console.error('Failed to import library:', error);
      alert('Failed to import library. Please check the file format.');
    }
  }, [excalidrawAPI]);

  return (
    <div className="h-full w-full">
      <Excalidraw
        ref={(api: any) => setExcalidrawAPI(api)}
        onChange={handleChange}
        onLibraryChange={handleLibraryChange}
        initialData={{
          libraryItems: []
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveToActiveFile />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas onSelect={resetCanvas} />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          <MainMenu.Separator />
          <MainMenu.Item onSelect={() => document.getElementById('library-import')?.click()}>
            Import Library
          </MainMenu.Item>
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
              <span className="font-medium">Library</span>
              <label 
                htmlFor="library-import" 
                className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
              >
                Import
              </label>
            </div>
          </Sidebar.Header>
          <div className="p-2">
            <div className="text-sm text-gray-600 mb-2">
              {libraryItems.length} items in library
            </div>
            {libraryItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm">No library items yet</div>
                <div className="text-xs mt-1">Import .excalidrawlib files</div>
              </div>
            )}
          </div>
        </Sidebar>
      </Excalidraw>
      
      {/* Hidden file input for library import */}
      <input
        id="library-import"
        type="file"
        accept=".excalidrawlib,.json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            importLibrary(file);
          }
        }}
      />
    </div>
  );
}