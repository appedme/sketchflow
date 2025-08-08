import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface FileTab {
    id: string;
    type: 'canvas' | 'document';
    title: string;
    isDirty: boolean;
    lastModified: string;
}

export interface WorkspacePanel {
    id: string;
    fileId: string;
    type: 'canvas' | 'document';
    size: number; // percentage
}

interface WorkspaceState {
    // Current project
    projectId: string | null;

    // UI State
    sidebarVisible: boolean;
    sidebarWidth: number;
    fullscreenMode: boolean;

    // File management
    openFiles: Record<string, FileTab>;
    panels: WorkspacePanel[];
    activeFileId: string | null;

    // Layout
    layout: 'horizontal' | 'vertical';

    // File content cache
    fileCache: Record<string, any>;

    // Actions
    initializeWorkspace: (projectId: string) => void;

    // Sidebar actions
    toggleSidebar: () => void;
    setSidebarWidth: (width: number) => void;
    toggleFullscreen: () => void;

    // File actions
    openFile: (fileId: string, type: 'canvas' | 'document', title: string) => void;
    closeFile: (fileId: string) => void;
    setActiveFile: (fileId: string) => void;
    markFileDirty: (fileId: string, isDirty: boolean) => void;

    // Panel actions
    addPanel: (fileId: string, type: 'canvas' | 'document') => void;
    removePanel: (panelId: string) => void;
    resizePanel: (panelId: string, size: number) => void;
    setLayout: (layout: 'horizontal' | 'vertical') => void;

    // Cache actions
    setCacheData: (fileId: string, data: any) => void;
    getCacheData: (fileId: string) => any;
    clearCache: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                projectId: null,
                sidebarVisible: true,
                sidebarWidth: 25,
                fullscreenMode: false,
                openFiles: {},
                panels: [],
                activeFileId: null,
                layout: 'horizontal',
                fileCache: {},

                // Initialize workspace
                initializeWorkspace: (projectId: string) => {
                    const state = get();
                    // Only reinitialize if project changed
                    if (state.projectId !== projectId) {
                        set({
                            projectId,
                            openFiles: {},
                            panels: [],
                            activeFileId: null,
                            // Keep UI preferences but clear file-specific state
                        });
                    }
                },

                // Sidebar actions
                toggleSidebar: () => {
                    set((state) => ({
                        sidebarVisible: !state.sidebarVisible,
                    }));
                },

                setSidebarWidth: (width: number) => {
                    set({
                        sidebarWidth: Math.max(15, Math.min(40, width)),
                    });
                },

                toggleFullscreen: () => {
                    set((state) => ({
                        fullscreenMode: !state.fullscreenMode,
                    }));
                },

                // File actions
                openFile: (fileId: string, type: 'canvas' | 'document', title: string) => {
                    const state = get();
                    const newOpenFiles = { ...state.openFiles };

                    // Add to open files if not already open
                    if (!newOpenFiles[fileId]) {
                        newOpenFiles[fileId] = {
                            id: fileId,
                            type,
                            title,
                            isDirty: false,
                            lastModified: new Date().toISOString(),
                        };
                    }

                    set({
                        openFiles: newOpenFiles,
                        activeFileId: fileId,
                    });
                },

                closeFile: (fileId: string) => {
                    const state = get();
                    const newOpenFiles = { ...state.openFiles };
                    delete newOpenFiles[fileId];

                    // Update active file
                    let newActiveFileId = state.activeFileId;
                    if (state.activeFileId === fileId) {
                        const remainingFiles = Object.keys(newOpenFiles);
                        newActiveFileId = remainingFiles.length > 0 ? remainingFiles[0] : null;
                    }

                    // Clear cache for closed file
                    const newFileCache = { ...state.fileCache };
                    delete newFileCache[fileId];

                    set({
                        openFiles: newOpenFiles,
                        activeFileId: newActiveFileId,
                        fileCache: newFileCache,
                    });
                },

                setActiveFile: (fileId: string) => {
                    const state = get();
                    if (state.openFiles[fileId]) {
                        set({ activeFileId: fileId });
                    }
                },

                markFileDirty: (fileId: string, isDirty: boolean) => {
                    const state = get();
                    if (state.openFiles[fileId]) {
                        const newOpenFiles = {
                            ...state.openFiles,
                            [fileId]: {
                                ...state.openFiles[fileId],
                                isDirty,
                                lastModified: new Date().toISOString(),
                            },
                        };
                        set({ openFiles: newOpenFiles });
                    }
                },

                // Panel actions
                addPanel: (fileId: string, type: 'canvas' | 'document') => {
                    const state = get();
                    const newPanel: WorkspacePanel = {
                        id: `panel-${fileId}-${Date.now()}`,
                        fileId,
                        type,
                        size: 50,
                    };

                    let newPanels = [...state.panels];

                    // Adjust existing panels
                    if (state.panels.length > 0) {
                        const sizePerPanel = 100 / (state.panels.length + 1);
                        newPanels = state.panels.map(panel => ({
                            ...panel,
                            size: sizePerPanel,
                        }));
                        newPanel.size = sizePerPanel;
                    } else {
                        newPanel.size = 100;
                    }

                    newPanels.push(newPanel);
                    set({ panels: newPanels });
                },

                removePanel: (panelId: string) => {
                    const state = get();
                    const newPanels = state.panels.filter(panel => panel.id !== panelId);

                    // Redistribute sizes
                    if (newPanels.length > 0) {
                        const sizePerPanel = 100 / newPanels.length;
                        newPanels.forEach(panel => {
                            panel.size = sizePerPanel;
                        });
                    }

                    set({ panels: newPanels });
                },

                resizePanel: (panelId: string, size: number) => {
                    const state = get();
                    const newPanels = state.panels.map(panel =>
                        panel.id === panelId
                            ? { ...panel, size: Math.max(10, Math.min(90, size)) }
                            : panel
                    );
                    set({ panels: newPanels });
                },

                setLayout: (layout: 'horizontal' | 'vertical') => {
                    set({ layout });
                },

                // Cache actions
                setCacheData: (fileId: string, data: any) => {
                    const state = get();
                    set({
                        fileCache: {
                            ...state.fileCache,
                            [fileId]: {
                                ...data,
                                cachedAt: Date.now(),
                            },
                        },
                    });
                },

                getCacheData: (fileId: string) => {
                    return get().fileCache[fileId];
                },

                clearCache: () => {
                    set({ fileCache: {} });
                },
            }),
            {
                name: 'workspace-store',
                partialize: (state) => ({
                    // Only persist UI preferences, not file-specific data
                    sidebarVisible: state.sidebarVisible,
                    sidebarWidth: state.sidebarWidth,
                    layout: state.layout,
                    fullscreenMode: state.fullscreenMode,
                }),
            }
        ),
        {
            name: 'workspace-store',
        }
    )
);