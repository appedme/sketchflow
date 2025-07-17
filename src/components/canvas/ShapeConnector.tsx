"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface ShapeConnectorProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  elements: readonly ExcalidrawElement[];
  onElementsChange: (elements: readonly ExcalidrawElement[]) => void;
}

interface HoverZone {
  id: string;
  elementId: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlusIconPosition {
  x: number;
  y: number;
  side: 'top' | 'right' | 'bottom' | 'left';
  elementId: string;
}

export function ShapeConnector({ excalidrawAPI, elements, onElementsChange }: ShapeConnectorProps) {
  const [hoveredZone, setHoveredZone] = useState<HoverZone | null>(null);
  const [plusIconPosition, setPlusIconPosition] = useState<PlusIconPosition | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Get rectangles and other supported shapes
  const getSupportedShapes = useCallback(() => {
    return elements.filter(element => 
      element.type === 'rectangle' || 
      element.type === 'ellipse' || 
      element.type === 'diamond'
    );
  }, [elements]);

  // Calculate hover zones for each shape
  const calculateHoverZones = useCallback((shapes: readonly ExcalidrawElement[]): HoverZone[] => {
    if (!excalidrawAPI) return [];

    const appState = excalidrawAPI.getAppState();
    const zoom = appState.zoom.value;
    const scrollX = appState.scrollX;
    const scrollY = appState.scrollY;

    const zones: HoverZone[] = [];
    const hoverZoneWidth = 20; // Width of hover zone in pixels

    shapes.forEach(element => {
      // Convert element coordinates to screen coordinates
      const screenX = (element.x + scrollX) * zoom;
      const screenY = (element.y + scrollY) * zoom;
      const screenWidth = element.width * zoom;
      const screenHeight = element.height * zoom;

      // Top zone
      zones.push({
        id: `${element.id}-top`,
        elementId: element.id,
        side: 'top',
        x: screenX - hoverZoneWidth / 2,
        y: screenY - hoverZoneWidth,
        width: screenWidth + hoverZoneWidth,
        height: hoverZoneWidth,
      });

      // Right zone
      zones.push({
        id: `${element.id}-right`,
        elementId: element.id,
        side: 'right',
        x: screenX + screenWidth,
        y: screenY - hoverZoneWidth / 2,
        width: hoverZoneWidth,
        height: screenHeight + hoverZoneWidth,
      });

      // Bottom zone
      zones.push({
        id: `${element.id}-bottom`,
        elementId: element.id,
        side: 'bottom',
        x: screenX - hoverZoneWidth / 2,
        y: screenY + screenHeight,
        width: screenWidth + hoverZoneWidth,
        height: hoverZoneWidth,
      });

      // Left zone
      zones.push({
        id: `${element.id}-left`,
        elementId: element.id,
        side: 'left',
        x: screenX - hoverZoneWidth,
        y: screenY - hoverZoneWidth / 2,
        width: hoverZoneWidth,
        height: screenHeight + hoverZoneWidth,
      });
    });

    return zones;
  }, [excalidrawAPI]);

  // Check if mouse is in any hover zone
  const checkHoverZones = useCallback((mouseX: number, mouseY: number) => {
    const shapes = getSupportedShapes();
    const zones = calculateHoverZones(shapes);

    for (const zone of zones) {
      if (
        mouseX >= zone.x &&
        mouseX <= zone.x + zone.width &&
        mouseY >= zone.y &&
        mouseY <= zone.y + zone.height
      ) {
        setHoveredZone(zone);
        
        // Calculate plus icon position
        let iconX = zone.x;
        let iconY = zone.y;
        
        switch (zone.side) {
          case 'top':
            iconX = zone.x + zone.width / 2;
            iconY = zone.y + zone.height / 2;
            break;
          case 'right':
            iconX = zone.x + zone.width / 2;
            iconY = zone.y + zone.height / 2;
            break;
          case 'bottom':
            iconX = zone.x + zone.width / 2;
            iconY = zone.y + zone.height / 2;
            break;
          case 'left':
            iconX = zone.x + zone.width / 2;
            iconY = zone.y + zone.height / 2;
            break;
        }

        setPlusIconPosition({
          x: iconX,
          y: iconY,
          side: zone.side,
          elementId: zone.elementId,
        });
        return;
      }
    }

    setHoveredZone(null);
    setPlusIconPosition(null);
  }, [getSupportedShapes, calculateHoverZones]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    setMousePosition({ x: mouseX, y: mouseY });
    checkHoverZones(mouseX, mouseY);
  }, [checkHoverZones]);

  // Handle plus icon click
  const handlePlusClick = useCallback(() => {
    if (!plusIconPosition || !excalidrawAPI) return;

    const originalElement = elements.find(el => el.id === plusIconPosition.elementId);
    if (!originalElement) return;

    const appState = excalidrawAPI.getAppState();
    const zoom = appState.zoom.value;
    const scrollX = appState.scrollX;
    const scrollY = appState.scrollY;

    // Calculate new element position based on side
    let newX = originalElement.x;
    let newY = originalElement.y;
    const spacing = 20; // Space between elements

    switch (plusIconPosition.side) {
      case 'top':
        newY = originalElement.y - originalElement.height - spacing;
        break;
      case 'right':
        newX = originalElement.x + originalElement.width + spacing;
        break;
      case 'bottom':
        newY = originalElement.y + originalElement.height + spacing;
        break;
      case 'left':
        newX = originalElement.x - originalElement.width - spacing;
        break;
    }

    // Create new element with same properties as original
    const newElement: ExcalidrawElement = {
      ...originalElement,
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: newX,
      y: newY,
      seed: Math.floor(Math.random() * 2147483647),
      versionNonce: Math.floor(Math.random() * 2147483647),
      isDeleted: false,
      groupIds: [],
      frameId: null,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    } as ExcalidrawElement;

    // Create connecting line
    const lineStartX = originalElement.x + originalElement.width / 2;
    const lineStartY = originalElement.y + originalElement.height / 2;
    const lineEndX = newX + originalElement.width / 2;
    const lineEndY = newY + originalElement.height / 2;

    const connectingLine: ExcalidrawElement = {
      type: 'line',
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: Math.min(lineStartX, lineEndX),
      y: Math.min(lineStartY, lineEndY),
      width: Math.abs(lineEndX - lineStartX),
      height: Math.abs(lineEndY - lineStartY),
      angle: 0,
      strokeColor: originalElement.strokeColor,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      points: [
        [0, 0],
        [lineEndX - lineStartX, lineEndY - lineStartY],
      ],
      lastCommittedPoint: null,
      startBinding: null,
      endBinding: null,
      startArrowhead: null,
      endArrowhead: 'arrow',
      seed: Math.floor(Math.random() * 2147483647),
      versionNonce: Math.floor(Math.random() * 2147483647),
      isDeleted: false,
      groupIds: [],
      frameId: null,
      roundness: null,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    } as ExcalidrawElement;

    // Add new elements to the scene
    const newElements = [...elements, newElement, connectingLine];
    onElementsChange(newElements);

    // Clear hover state
    setHoveredZone(null);
    setPlusIconPosition(null);
  }, [plusIconPosition, excalidrawAPI, elements, onElementsChange]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ zIndex: 1000 }}
    >
      {/* Plus icon */}
      {plusIconPosition && (
        <button
          className="absolute w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 pointer-events-auto cursor-pointer"
          style={{
            left: plusIconPosition.x - 16,
            top: plusIconPosition.y - 16,
            transform: 'translate(0, 0)',
          }}
          onClick={handlePlusClick}
          onMouseEnter={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* Debug: Show hover zones (remove in production) */}
      {process.env.NODE_ENV === 'development' && hoveredZone && (
        <div
          className="absolute bg-blue-200 bg-opacity-30 border border-blue-400 pointer-events-none"
          style={{
            left: hoveredZone.x,
            top: hoveredZone.y,
            width: hoveredZone.width,
            height: hoveredZone.height,
          }}
        />
      )}
    </div>
  );
}