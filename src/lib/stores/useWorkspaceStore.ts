import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { PERFORMANCE_CONFIG } from '@/lib/performance';

export interface FileTab {
    id: string;
    type: 'canvas' | 'document';
    title: string;
    isDirty: boolean;
    lastModified: string;
}

interface WorkspaceState {
    projectId: string | null;
    sidebarVisible: boolean;
    sidebarWidth: number;
    fullscreenMode: boolean;
    openFiles: Record<string, FileTab>;
    activeFileId: string | null;
    layout: 'horizontal' | 'vertical';
    fileCache: Record<string, { data: any; cachedAt: number; ttl: number }>;

    // Actions
    initializeWorkspace: (projectId: string) => void;
    toggleSidebar: () => void;
    setSidebarWidth: (width: number) => void;
    toggleFullscreen: () => void;
    openFile: (fileId: string, type: 'canvas' | 'document', title: string) => void;
    closeFile: (fileId: string) => void;
    setActiveFile: (fileId: string) => void;
    markFileDirty: (fileId: string, isDirty: boolean) => void;
    setCacheData: (fileId: string, data: any, ttl?: number) => void;
    getCacheData: (fileId: string) => any;
    clearCache: () => void;
    clearExpiredCache: () => void;
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

                    initializeWorkspace: (projectId: string) => {
                        set((state) => {
                            if (state.projectId !== projectId) {
                                state.projectId = projectId;
                                state.openFiles = {};
                                state.activeFileId = null;
                                
                                // Clear expired cache
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
                                };
                            }
                            state.activeFileId = fileId;
                        });
                    },

                    closeFile: (fileId: string) => {
                        set((state) => {
                            delete state.openFiles[fileId];
                            if (state.activeFileId === fileId) {
                                const remainingFiles = Object.keys(state.openFiles);
                                state.activeFileId = remainingFiles.length > 0 ? remainingFiles[0] : null;
                            }
                            delete state.fileCache[fileId];
                        });
                    },

                    setActiveFile: (fileId: string) => {
                        set((state) => {
                            if (state.openFiles[fileId] && state.activeFileId !== fileId) {
                                state.activeFileId = fileId;
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

                    setCacheData: (fileId: string, data: any, ttl: number = PERFORMANCE_CONFIG.CACHE_TTL.FILE_DATA) => {
                        set((state) => {
                            state.fileCache[fileId] = { data, cachedAt: Date.now(), ttl };
                            
                            // Cleanup if cache is too large
                            const cacheKeys = Object.keys(state.fileCache);
                            if (cacheKeys.length > PERFORMANCE_CONFIG.MAX_CACHE_SIZE) {
                                const oldestKey = cacheKeys.reduce((oldest, key) => 
                                    state.fileCache[key].cachedAt < state.fileCache[oldest].cachedAt ? key : oldest
                                );
                                delete state.fileCache[oldestKey];
                            }
                        });
                    },

                    getCacheData: (fileId: string) => {
                        const cached = get().fileCache[fileId];
                        if (!cached) return null;
                        
                        if (Date.now() - cached.cachedAt > cached.ttl) {
                            set((state) => { delete state.fileCache[fileId]; });
                            return null;
                        }
                        
                        return cached.data;
                    },

                    clearCache: () => set((state) => { state.fileCache = {}; }),
                    
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
                }))
            ),
            {
                name: 'workspace-store',
                partialize: (state) => ({
                    sidebarVisible: state.sidebarVisible,
                    sidebarWidth: state.sidebarWidth,
                    layout: state.layout,
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
    }, PERFORMANCE_CONFIG.CLEANUP_INTERVAL);
}
