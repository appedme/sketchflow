'use client';

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Folder, File, ChevronDown, ChevronRight, Plus, Trash, Download, Upload, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CacheControls } from './CacheControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notifyFileSelected } from '@/lib/fileCache';
import { useCacheContext } from '@/contexts/CacheContext';
import { toast } from 'sonner';

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
}

// Memoized folder item component to prevent unnecessary re-renders
const FolderItem = memo(function FolderItem({
    item,
    level,
    selectedFileId,
    onFileClick
}: FolderItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }, []);

    const handleFileClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onFileClick(item);
    }, [item, onFileClick]);

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
                className={`flex items-center py-1 px-2 rounded-md hover:bg-muted cursor-pointer ${selectedFileId === item.id ? 'bg-primary/10 text-primary' : ''
                    }`}
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
                <span className="text-sm truncate">{item.name}</span>
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

FolderItem.displayName = 'FolderItem';

export function FilesPanel() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { saveAllCaches, revalidateAllCaches } = useCacheContext();

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

            // Notify the system that this file has been selected
            // This will trigger a fresh data load
            notifyFileSelected(file.path);

            // Show loading indicator briefly for visual feedback
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 100);

            // Dispatch a custom event to notify that a file has been selected
            window.dispatchEvent(new CustomEvent('file:selected', {
                detail: { file, path: file.path }
            }));
        }
    }, []);

    // Handle save all
    const handleSaveAll = useCallback(() => {
        saveAllCaches();
        toast.success('All caches saved successfully');
    }, [saveAllCaches]);

    // Handle revalidate all
    const handleRevalidateAll = useCallback(() => {
        revalidateAllCaches();
        toast.success('Revalidating all data');
    }, [revalidateAllCaches]);

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
                    ) : (
                        sampleFiles.map((item) => (
                            <FolderItem
                                key={item.id}
                                item={item}
                                level={0}
                                selectedFileId={selectedFile?.id || null}
                                onFileClick={handleFileClick}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Cache Controls */}
            <CacheControls />
        </div>
    );
}