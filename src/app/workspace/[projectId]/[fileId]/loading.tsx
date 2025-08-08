import { Loader2 } from 'lucide-react';

export default function WorkspaceLoading() {
    return (
        <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Loading Workspace</h3>
                    <p className="text-sm text-muted-foreground">
                        Setting up your development environment...
                    </p>
                </div>
                <div className="w-64 bg-muted rounded-full h-1 mx-auto">
                    <div className="bg-primary h-1 rounded-full animate-pulse w-1/3" />
                </div>
            </div>
        </div>
    );
}