'use client';

import React from 'react';
import { useFileOperations, FileStatusIndicator } from './FileStatusIndicator';
import { cn } from '@/lib/utils';

export function FileOperationsStatus() {
    const { operations } = useFileOperations();
    const operationsList = Object.entries(operations);

    if (operationsList.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {operationsList.map(([id, operation]) => (
                <div
                    key={id}
                    className={cn(
                        'bg-background border rounded-md shadow-md overflow-hidden transition-all',
                        operation.status === 'loading' ? 'border-primary' :
                            operation.status === 'success' ? 'border-green-500' :
                                operation.status === 'error' ? 'border-red-500' : 'border-border'
                    )}
                >
                    <FileStatusIndicator
                        type={operation.type}
                        status={operation.status}
                        message={operation.message}
                    />
                </div>
            ))}
        </div>
    );
}