import React from 'react';
import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ModeTogglerProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ModeToggler: React.FC<ModeTogglerProps> = ({
  viewMode,
  onViewModeChange,
  className = ''
}) => {
  return (
    <div className={cn(
      "flex bg-muted border border-border rounded-md p-1 overflow-hidden",
      className
    )}>
      <button
        className={cn(
          "flex items-center justify-center px-3 py-2 border-0 cursor-pointer transition-all duration-200 rounded-sm min-w-[40px] h-9 relative",
          viewMode === 'grid'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => onViewModeChange('grid')}
        title="Grid View"
        aria-label="Switch to grid view"
      >
        <Grid3X3 className="w-[18px] h-[18px]" />
      </button>
      <button
        className={cn(
          "flex items-center justify-center px-3 py-2 border-0 cursor-pointer transition-all duration-200 rounded-sm min-w-[40px] h-9 relative",
          viewMode === 'list'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => onViewModeChange('list')}
        title="List View"
        aria-label="Switch to list view"
      >
        <List className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
};

export default ModeToggler;
