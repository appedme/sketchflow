"use client";

import { Button } from '@/components/ui/button';
import {
    PenTool,
    Square,
    Circle,
    ArrowRight,
    Type,
    Image,
    Palette,
    Zap
} from 'lucide-react';

interface CanvasWelcomeScreenProps {
    projectName?: string;
    onGetStarted?: () => void;
}

export function CanvasWelcomeScreen({
    projectName = "Canvas",
    onGetStarted
}: CanvasWelcomeScreenProps) {
    const tools = [
        { icon: PenTool, label: 'Draw', description: 'Freehand drawing' },
        { icon: Square, label: 'Shapes', description: 'Rectangles & squares' },
        { icon: Circle, label: 'Circles', description: 'Circles & ellipses' },
        { icon: ArrowRight, label: 'Arrows', description: 'Connect ideas' },
        { icon: Type, label: 'Text', description: 'Add labels' },
        { icon: Image, label: 'Images', description: 'Upload pictures' },
    ];

    return (
        <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-6">
                {/* Logo and Title */}
                <div className="mb-8">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center mb-4">
                            <img
                                src="/logo.svg"
                                alt="SketchFlow"
                                className="w-10 h-10"
                            />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl border border-primary/20 animate-pulse"></div>
                    </div>

                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome to {projectName}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Start creating with powerful drawing tools and collaborative features
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {tools.map((tool, index) => (
                        <div
                            key={tool.label}
                            className="group p-4 rounded-xl border border-border bg-card hover:bg-accent transition-all duration-200 hover:scale-105"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-10 h-10 mx-auto mb-3 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <tool.icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-medium text-sm text-foreground mb-1">
                                {tool.label}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {tool.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Palette className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-medium text-sm">Rich Drawing Tools</h4>
                            <p className="text-xs text-muted-foreground">Professional drawing and design tools</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-medium text-sm">Real-time Sync</h4>
                            <p className="text-xs text-muted-foreground">Auto-save and collaborate in real-time</p>
                        </div>
                    </div>
                </div>

                {/* Get Started Button */}
                <div className="space-y-4">
                    <Button
                        size="lg"
                        className="gap-2 px-8"
                        onClick={onGetStarted}
                    >
                        <PenTool className="w-5 h-5" />
                        Start Drawing
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Click anywhere on the canvas or use the toolbar to begin
                    </p>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Quick Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">V</kbd> for selection tool</div>
                        <div>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">R</kbd> for rectangle</div>
                        <div>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">O</kbd> for circle</div>
                        <div>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">T</kbd> for text</div>
                    </div>
                </div>
            </div>
        </div>
    );
}