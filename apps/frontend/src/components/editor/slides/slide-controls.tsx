import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Grid,
  Ruler,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Map,
  Move,
  Plus,
  Minus,
  PaintBucket,
  Image as ImageIcon,
  Play,
} from 'lucide-react';

interface SlideControlsProps {
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  onAlignChange: (align: 'left' | 'center' | 'right' | 'justify') => void;
  showGrid: boolean;
  onGridToggle: () => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  showRulers: boolean;
  onRulersToggle: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  showMinimap: boolean;
  onMinimapToggle: () => void;
  showAnimations: boolean;
  onAnimationsToggle: () => void;
  backgroundPattern?: string;
  onBackgroundPatternChange: (pattern: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
}

const patterns = [
  { id: 'none', name: 'None' },
  { id: 'dots', name: 'Dots' },
  { id: 'lines', name: 'Lines' },
  { id: 'grid', name: 'Grid' },
  { id: 'diagonal', name: 'Diagonal' },
  { id: 'circles', name: 'Circles' },
  { id: 'waves', name: 'Waves' },
];

export function SlideControls({
  backgroundColor,
  onBackgroundChange,
  textAlign,
  onAlignChange,
  showGrid,
  onGridToggle,
  gridSize,
  onGridSizeChange,
  showRulers,
  onRulersToggle,
  zoom,
  onZoomChange,
  isFullscreen,
  onFullscreenToggle,
  showMinimap,
  onMinimapToggle,
  showAnimations,
  onAnimationsToggle,
  backgroundPattern,
  onBackgroundPatternChange,
  onUndo,
  onRedo,
  className,
}: SlideControlsProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <PaintBucket className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ColorPicker
                  color={backgroundColor}
                  onChange={onBackgroundChange}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="start">
                <div className="space-y-2">
                  <Label>Background Pattern</Label>
                  {patterns.map((pattern) => (
                    <Button
                      key={pattern.id}
                      variant={backgroundPattern === pattern.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => onBackgroundPatternChange(pattern.id)}
                    >
                      {pattern.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={textAlign === 'left' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onAlignChange('left')}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={textAlign === 'center' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onAlignChange('center')}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={textAlign === 'right' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onAlignChange('right')}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant={textAlign === 'justify' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onAlignChange('justify')}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant={showGrid ? 'default' : 'ghost'}
              size="icon"
              onClick={onGridToggle}
            >
              <Grid className="h-4 w-4" />
            </Button>

            <Button
              variant={showRulers ? 'default' : 'ghost'}
              size="icon"
              onClick={onRulersToggle}
            >
              <Ruler className="h-4 w-4" />
            </Button>

            <Button
              variant={showMinimap ? 'default' : 'ghost'}
              size="icon"
              onClick={onMinimapToggle}
            >
              <Map className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreenToggle}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Grid Size</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onGridSizeChange(Math.max(4, gridSize - 4))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                value={[gridSize]}
                min={4}
                max={48}
                step={4}
                onValueChange={([value]) => onGridSizeChange(value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => onGridSizeChange(Math.min(48, gridSize + 4))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zoom</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoom * 100]}
                min={10}
                max={200}
                step={10}
                onValueChange={([value]) => onZoomChange(value / 100)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onZoomChange(1)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Layers className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Move className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="animation" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Animations</Label>
            <Switch
              checked={showAnimations}
              onCheckedChange={onAnimationsToggle}
            />
          </div>
          <Button
            variant={showAnimations ? 'default' : 'ghost'}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Preview Animations
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
