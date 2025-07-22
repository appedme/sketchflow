'use client';

import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from 'react';
import { Folder, File, ChevronDown, ChevronRight, Plus, Trash, Download, Upload, Save, RefreshCw, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CacheControls } from './CacheControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notifyFileSelected } from '@/lib/fileCache';
import { useCacheContext } from '@/contexts/CacheContext';
import { toast } from 'sonner';
import { useFileOperations } from './FileStatusIndicator';
import { useLoading } from '@/components/ui/loading-bar';
import { cn } from '@/lib/utils';

interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    children?: FileItem[];
    path: string;
}

// Sample data structure - in a real app, this would come from your backend
const sampleFiles: FileItem[] = [
    {
        id: '1',
        name: 'Project Files',
        type: 'folder',
        path: '/project-files',
        children: [
            {
                id: '2',
                name: 'Documents',
                type: 'folder',
                path: '/project-files/documents',
                children: [
                    { id: '3', name: 'Requirements.md', type: 'file', path: '/project-files/documents/requirements.md' },
                    { id: '4', name: 'Specs.md', type: 'file', path: '/project-files/documents/specs.md' },
                ]
            },
            { id: '5', name: 'README.md', type: 'file', path: '/project-files/readme.md' },
        ]
    },
    {
        id: '6',
        name: 'Assets',
        type: 'folder',
        path: '/assets',
        children: [
            { id: '7', name: 'logo.svg', type: 'file', path: '/assets/logo.svg' },
            { id: '8', name: 'banner.png', type: 'file', path: '/assets/banner.png' },
        ]
    }
];

interface FolderItemProps {
    item: FileItem;
    level: number;
    selectedFileId: string | null;
    onFileClick: (file: FileItem) => void;
    onRename: (file: FileItem, newName: string) => void;
}

// Memoized folder item component to prevent unnecessary re-renders
const FolderItem = memo(function FolderItem({
    item,
    level,
    selectedFileId,
    onFileClick,
    onRename
}: FolderItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(item.name);
    const renameInputRef = useRef<HTMLInputElement>(null);
    const { operations } = useFileOperations();

    // Check if this item is being renamed
    const isRenamingOperation = Object.values(operations).some(
        op => op.type === 'renaming' && op.filePath === item.path
    );

    const toggleFolder = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }, []);

    const handleFileClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isRenaming) {
            onFileClick(item);
        }
    }, [item, onFileClick, isRenaming]);

    // Start renaming
    const handleStartRename = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRenaming(true);
        setNewName(item.name);
    }, [item.name]);

    // Handle rename input change
    const handleRenameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(e.target.value);
    }, []);

    // Submit rename
    const handleRenameSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newName !== item.name) {
            onRename(item, newName);
        }
        setIsRenaming(false);
    }, [item, newName, onRename]);

    // Cancel rename on escape
    const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsRenaming(false);
            setNewName(item.name);
        }
    }, [item.name]);

    // Focus input when renaming starts
    useEffect(() => {
        if (isRenaming && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [isRenaming]);

    // Pre-select the folder if the selected file is inside it
    useEffect(() => {
        if (selectedFileId && item.type === 'folder' && item.children) {
            const hasSelectedChild = item.children.some(
                child => child.id === selectedFileId ||
                    (child.type === 'folder' && child.children?.some(grandchild => grandchild.id === selectedFileId))
            );

            if (hasSelectedChild) {
                setIsOpen(true);
            }
        }
    }, [selectedFileId, item]);

    return (
        <div>
            <div
                className={cn(
                    'flex items-center py-1 px-2 rounded-md hover:bg-muted cursor-pointer group',
                    selectedFileId === item.id ? 'bg-primary/10 text-primary' : '',
                    isRenamingOperation ? 'opacity-50' : ''
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={item.type === 'folder' ? toggleFolder : handleFileClick}
            >
                {item.type === 'folder' ? (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 mr-1"
                            onClick={toggleFolder}
                            tabIndex={-1} // Prevent focus
                        >
                            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                        <Folder className="h-4 w-4 mr-2 text-blue-500" />
                    </>
                ) : (
                    <>
                        <div className="w-4 mr-1" />
                        <File className="h-4 w-4 mr-2 text-gray-500" />
                    </>
                )}

                {isRenaming ? (
                    <form onSubmit={handleRenameSubmit} className="flex-1" onClick={e => e.stopPropagation()}>
                        <Input
                            ref={renameInputRef}
                            value={newName}
                            onChange={handleRenameChange}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={() => setIsRenaming(false)}
                            className="h-6 py-0 px-1 text-xs"
                            autoFocus
                        />
                    </form>
                ) : (
                    <>
                        <span className="text-sm truncate flex-1">{item.name}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartRename}
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            tabIndex={-1}
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    </>
                )}
            </div>

            {isOpen && item.children && (
                <div>
                    {item.children.map((child) => (
                        <FolderItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            selectedFileId={selectedFileId}
                            onFileClick={onFileClick}
                            onRename={onRename}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

FolderItem.displayName = 'FolderItem';

export function FilesPanel() {
    const [files, setFiles] = useState<FileItem[]>(sampleFiles);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { saveAllCaches, revalidateAllCaches } = useCacheContext();
    const { startOperation, completeOperation } = useFileOperations();
    const { startLoading, completeLoading } = useLoading();

    // Debounced search handler to prevent excessive re-renders
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
    }, []);

    // Keep focus on search input when typing
    useEffect(() => {
        const input = searchInputRef.current;
        if (input) {
            // Create a more robust focus management system
            let focusTimeout: NodeJS.Timeout;

            const handleBlur = (e: FocusEvent) => {
                // Only refocus if the blur wasn't to another input element
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (!relatedTarget || !relatedTarget.matches('input, button, [role="button"]')) {
                    // Store cursor position
                    const cursorPosition = input.selectionStart;

                    // Clear any existing timeout
                    clearTimeout(focusTimeout);

                    // Set a new timeout to restore focus
                    focusTimeout = setTimeout(() => {
                        if (document.activeElement !== input) {
                            input.focus();
                            if (cursorPosition !== null) {
                                input.setSelectionRange(cursorPosition, cursorPosition);
                            }
                        }
                    }, 10);
                }
            };

            input.addEventListener('blur', handleBlur as EventListener);

            return () => {
                input.removeEventListener('blur', handleBlur as EventListener);
                clearTimeout(focusTimeout);
            };
        }
    }, []);

    // Optimized file click handler with immediate feedback
    const handleFileClick = useCallback((file: FileItem) => {
        if (file.type === 'file') {
            // Immediately update UI to show selection
            setSelectedFile(file);

            // Show loading indicator
            startLoading(`Loading ${file.name}...`);

            // Notify the system that this file has been selected
            // This will trigger a fresh data load
            notifyFileSelected(file.path);

            // Show loading indicator briefly for visual feedback
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                completeLoading(true, `Loaded ${file.name}`);
            }, 500);

            // Dispatch a custom event to notify that a file has been selected
            window.dispatchEvent(new CustomEvent('file:selected', {
                detail: { file, path: file.path }
            }));
        }
    }, [startLoading, completeLoading]);

    // Handle save all
    const handleSaveAll = useCallback(() => {
        startLoading('Saving all files...', 'default');
        saveAllCaches();

        setTimeout(() => {
            completeLoading(true, 'All files saved successfully');
            toast.success('All caches saved successfully');
        }, 800);
    }, [saveAllCaches, startLoading, completeLoading]);

    // Handle revalidate all
    const handleRevalidateAll = useCallback(() => {
        startLoading('Revalidating all data...', 'default');
        revalidateAllCaches();

        setTimeout(() => {
            completeLoading(true, 'All data revalidated');
            toast.success('Revalidating all data');
        }, 1000);
    }, [revalidateAllCaches, startLoading, completeLoading]);

    // Handle file rename with optimistic updates
    const handleRename = useCallback((file: FileItem, newName: string) => {
        // Generate a unique operation ID
        const operationId = `rename-${file.id}-${Date.now()}`;

        // Start the operation
        startOperation(operationId, 'renaming', file.path, `Renaming ${file.name} to ${newName}`);
        startLoading(`Renaming ${file.name}...`);

        // Create new path
        const pathParts = file.path.split('/');
        pathParts.pop(); // Remove old filename
        const newPath = [...pathParts, newName].join('/');

        // Optimistically update the UI
        setFiles(prevFiles => updateFileInTree(prevFiles, file.id, {
            ...file,
            name: newName,
            path: newPath
        }));

        // If this was the selected file, update the selection
        if (selectedFile && selectedFile.id === file.id) {
            setSelectedFile({
                ...selectedFile,
                name: newName,
                path: newPath
            });
        }

        // Simulate API call
        setTimeout(() => {
            // In a real app, this would be an API call
            // If successful:
            completeOperation(operationId, true, `Renamed to ${newName}`);
            completeLoading(true, `Renamed to ${newName}`);

            // If the API call fails, you would revert the optimistic update:
            // setFiles(prevFiles => updateFileInTree(prevFiles, file.id, file));
            // completeOperation(operationId, false, `Failed to rename ${file.name}`);
        }, 800);
    }, [selectedFile, startOperation, startLoading, completeLoading, completeOperation]);

    // Filter files based on search term
    const filteredFiles = useMemo(() => {
        if (!searchTerm) return files;

        // Deep clone and filter the file tree
        return filterFileTree(JSON.parse(JSON.stringify(files)), searchTerm.toLowerCase());
    }, [files, searchTerm]);

    return (
        <div className="h-full flex flex-col border-r bg-background">
            <div className="p-4 border-b">
                <h2 className="text-lg font-medium mb-2">Files</h2>
                <div className="flex items-center gap-2">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="h-8 text-sm"
                        // Better focus management
                        onFocus={(e) => {
                            // Select all text when focused
                            e.target.select();
                        }}
                    />
                </div>
            </div>

            <div className="p-2 border-b flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    New
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Trash className="h-3 w-3 mr-1" />
                    Delete
                </Button>

                {/* Save All and Revalidate All buttons */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs ml-auto"
                    onClick={handleSaveAll}
                >
                    <Save className="h-3 w-3 mr-1" />
                    Save All
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleRevalidateAll}
                >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Revalidate
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                        </div>
                    ) : filteredFiles.length > 0 ? (
                        filteredFiles.map((item) => (
                            <FolderItem
                                key={item.id}
                                item={item}
                                level={0}
                                selectedFileId={selectedFile?.id || null}
                                onFileClick={handleFileClick}
                                onRename={handleRename}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <File className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No files found</p>
                            {searchTerm && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Try a different search term
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Cache Controls */}
            <CacheControls />
        </div>
    );
}

// Helper function to update a file in the file tree
function updateFileInTree(files: FileItem[], fileId: string, updatedFile: FileItem): FileItem[] {
    return files.map(file => {
        if (file.id === fileId) {
            return updatedFile;
        }

        if (file.children) {
            return {
                ...file,
                children: updateFileInTree(file.children, fileId, updatedFile)
            };
        }

        return file;
    });
}

// Helper function to filter the file tree based on search term
function filterFileTree(files: FileItem[], searchTerm: string): FileItem[] {
    return files.filter(file => {
        // Check if this file/folder matches
        const matches = file.name.toLowerCase().includes(searchTerm);

        // If it's a folder, also check its children
        if (file.type === 'folder' && file.children) {
            file.children = filterFileTree(file.children, searchTerm);

            // Include this folder if it has matching children, even if the folder name doesn't match
            return matches || file.children.length > 0;
        }

        return matches;
    });
}