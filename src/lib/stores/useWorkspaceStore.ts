import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// Enable MapSet plugin for Immer
enableMapSet();

export interface FileTab {
    id: string;
    type: 'canvas' | 'document';
    title: string;
    isDirty: boolean;
    lastModified: string;
    cachedData?: any;
    lastAccessed: string;
}

interface WorkspaceState {
    projectId: string | null;
    sidebarVisible: boolean;
    sidebarWidth: number;
    fullscreenMode: boolean;
    openFiles: Record<string, FileTab>;
    activeFileId: string | null;
    layout: 'horizontal' | 'vertical';
    
    fileCache: Record<string, { 
        data: any; 
        cachedAt: number; 
        ttl: number;
        version: number;
    }>;
    
    // Use array instead of Set for serialization
    mountedEditors: string[];

    // Actions
    initializeWorkspace: (projectId: string) => void;
    toggleSidebar: () => void;
    setSidebarWidth: (width: number) => void;
    toggleFullscreen: () => void;
    openFile: (fileId: string, type: 'canvas' | 'document', title: string) => void;
    closeFile: (fileId: string) => void;
    setActiveFile: (fileId: string) => void;
    markFileDirty: (fileId: string, isDirty: boolean) => void;
    updateFileTitle: (fileId: string, title: string) => void;
    setCacheData: (fileId: string, data: any, ttl?: number) => void;
    getCacheData: (fileId: string) => any;
    clearCache: () => void;
    clearExpiredCache: () => void;
    mountEditor: (fileId: string) => void;
    unmountEditor: (fileId: string) => void;
    isEditorMounted: (fileId: string) => boolean;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    devtools(
        persist(
            subscribeWithSelector(
                immer((set, get) => ({
                    projectId: null,
                    sidebarVisible: true,
                    sidebarWidth: 25,
                    fullscreenMode: false,
                    openFiles: {},
                    activeFileId: null,
                    layout: 'horizontal',
                    fileCache: {},
                    mountedEditors: [],

                    initializeWorkspace: (projectId: string) => {
                        set((state) => {
                            if (state.projectId !== projectId) {
                                state.projectId = projectId;
                                const now = Date.now();
                                Object.keys(state.fileCache).forEach(key => {
                                    const cached = state.fileCache[key];
                                    if (cached && now - cached.cachedAt > cached.ttl) {
                                        delete state.fileCache[key];
                                    }
                                });
                            }
                        });
                    },

                    toggleSidebar: () => set((state) => { state.sidebarVisible = !state.sidebarVisible; }),
                    setSidebarWidth: (width: number) => set((state) => { state.sidebarWidth = Math.max(15, Math.min(40, width)); }),
                    toggleFullscreen: () => set((state) => { state.fullscreenMode = !state.fullscreenMode; }),

                    openFile: (fileId: string, type: 'canvas' | 'document', title: string) => {
                        set((state) => {
                            if (!state.openFiles[fileId]) {
                                state.openFiles[fileId] = {
                                    id: fileId,
                                    type,
                                    title,
                                    isDirty: false,
                                    lastModified: new Date().toISOString(),
                                    lastAccessed: new Date().toISOString(),
                                };
                            } else {
                                state.openFiles[fileId].lastAccessed = new Date().toISOString();
                            }
                            state.activeFileId = fileId;
                            if (!state.mountedEditors.includes(fileId)) {
                                state.mountedEditors.push(fileId);
                            }
                        });
                    },

                    closeFile: (fileId: string) => {
                        set((state) => {
                            delete state.openFiles[fileId];
                            
                            if (state.activeFileId === fileId) {
                                const remainingFiles = Object.keys(state.openFiles);
                                state.activeFileId = remainingFiles.length > 0 ? remainingFiles[0] : null;
                            }
                        });
                        
                        // Delayed unmount
                        setTimeout(() => {
                            const currentState = get();
                            if (!currentState.openFiles[fileId]) {
                                set((s) => {
                                    s.mountedEditors = s.mountedEditors.filter(id => id !== fileId);
                                });
                            }
                        }, 30000);
                    },

                    setActiveFile: (fileId: string) => {
                        set((state) => {
                            if (state.openFiles[fileId] && state.activeFileId !== fileId) {
                                state.activeFileId = fileId;
                                state.openFiles[fileId].lastAccessed = new Date().toISOString();
                                if (!state.mountedEditors.includes(fileId)) {
                                    state.mountedEditors.push(fileId);
                                }
                            }
                        });
                    },

                    markFileDirty: (fileId: string, isDirty: boolean) => {
                        set((state) => {
                            if (state.openFiles[fileId] && state.openFiles[fileId].isDirty !== isDirty) {
                                state.openFiles[fileId].isDirty = isDirty;
                                state.openFiles[fileId].lastModified = new Date().toISOString();
                            }
                        });
                    },

                    updateFileTitle: (fileId: string, title: string) => {
                        set((state) => {
                            if (state.openFiles[fileId] && state.openFiles[fileId].title !== title) {
                                state.openFiles[fileId].title = title;
                            }
                        });
                    },

                    setCacheData: (fileId: string, data: any, ttl: number = 600000) => {
                        set((state) => {
                            state.fileCache[fileId] = {
                                data,
                                cachedAt: Date.now(),
                                ttl,
                                version: (state.fileCache[fileId]?.version || 0) + 1,
                            };
                            
                            if (state.openFiles[fileId]) {
                                state.openFiles[fileId].cachedData = data;
                            }
                            
                            const cacheKeys = Object.keys(state.fileCache);
                            if (cacheKeys.length > 20) {
                                const sortedKeys = cacheKeys.sort((a, b) => 
                                    state.fileCache[a].cachedAt - state.fileCache[b].cachedAt
                                );
                                sortedKeys.slice(0, 5).forEach(key => {
                                    delete state.fileCache[key];
                                });
                            }
                        });
                    },

                    getCacheData: (fileId: string) => {
                        const state = get();
                        const cached = state.fileCache[fileId];
                        
                        if (cached && Date.now() - cached.cachedAt <= cached.ttl) {
                            return cached.data;
                        }
                        
                        const fileTab = state.openFiles[fileId];
                        if (fileTab?.cachedData) {
                            return fileTab.cachedData;
                        }
                        
                        return null;
                    },

                    clearCache: () => {
                        set((state) => {
                            state.fileCache = {};
                            Object.values(state.openFiles).forEach(file => {
                                delete file.cachedData;
                            });
                        });
                    },

                    clearExpiredCache: () => {
                        set((state) => {
                            const now = Date.now();
                            Object.keys(state.fileCache).forEach(key => {
                                const cached = state.fileCache[key];
                                if (cached && now - cached.cachedAt > cached.ttl) {
                                    delete state.fileCache[key];
                                }
                            });
                        });
                    },

                    mountEditor: (fileId: string) => {
                        set((state) => {
                            if (!state.mountedEditors.includes(fileId)) {
                                state.mountedEditors.push(fileId);
                            }
                        });
                    },

                    unmountEditor: (fileId: string) => {
                        set((state) => {
                            state.mountedEditors = state.mountedEditors.filter(id => id !== fileId);
                        });
                    },

                    isEditorMounted: (fileId: string) => {
                        return get().mountedEditors.includes(fileId);
                    },
                }))
            ),
            {
                name: 'workspace-store',
                partialize: (state) => ({
                    sidebarVisible: state.sidebarVisible,
                    sidebarWidth: state.sidebarWidth,
                    layout: state.layout,
                    openFiles: state.openFiles,
                    activeFileId: state.activeFileId,
                    projectId: state.projectId,
                    mountedEditors: state.mountedEditors,
                }),
            }
        ),
        { name: 'workspace-store' }
    )
);

// Optimized selectors
export const useOpenFiles = () => useWorkspaceStore(state => state.openFiles);
export const useActiveFileId = () => useWorkspaceStore(state => state.activeFileId);
export const useSidebarState = () => useWorkspaceStore(state => ({
    visible: state.sidebarVisible,
    width: state.sidebarWidth,
}));
export const useFullscreenMode = () => useWorkspaceStore(state => state.fullscreenMode);

// Auto-cleanup
if (typeof window !== 'undefined') {
    setInterval(() => {
        useWorkspaceStore.getState().clearExpiredCache();
    }, 300000);
}