import React, { useCallback, useEffect, useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Label } from './label';
import { Input } from './input';
import { Slider } from './slider';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

// Convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Parse RGBA string
function parseRgba(rgba: string) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }
  return null;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  // Initialize state based on input color
  const [localColor, setLocalColor] = useState(() => {
    if (color.startsWith('#')) {
      return color;
    } else if (color.startsWith('rgb')) {
      const rgba = parseRgba(color);
      if (rgba) {
        setOpacity(Math.round(rgba.a * 100));
        return rgbToHex(rgba.r, rgba.g, rgba.b);
      }
    }
    return '#ffffff';
  });
  
  const [opacity, setOpacity] = useState(() => {
    if (color.startsWith('rgba')) {
      const rgba = parseRgba(color);
      return rgba ? Math.round(rgba.a * 100) : 100;
    }
    return 100;
  });

  // Update local state when prop changes
  useEffect(() => {
    if (color.startsWith('#')) {
      setLocalColor(color);
    } else if (color.startsWith('rgb')) {
      const rgba = parseRgba(color);
      if (rgba) {
        setLocalColor(rgbToHex(rgba.r, rgba.g, rgba.b));
        setOpacity(Math.round(rgba.a * 100));
      }
    }
  }, [color]);

  // Handle color change
  const handleColorChange = useCallback((newColor: string) => {
    setLocalColor(newColor);
    const rgb = hexToRgb(newColor);
    if (rgb) {
      onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`);
    }
  }, [opacity, onChange]);

  // Handle opacity change
  const handleOpacityChange = useCallback(([value]: number[]) => {
    setOpacity(value);
    const rgb = hexToRgb(localColor);
    if (rgb) {
      onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${value / 100})`);
    }
  }, [localColor, onChange]);

  return (
    <div className={cn("p-3 space-y-3", className)}>
      <HexColorPicker color={localColor} onChange={handleColorChange} />
      <div className="space-y-2">
        <Label>Hex Color</Label>
        <HexColorInput
          color={localColor}
          onChange={handleColorChange}
          prefixed
          className="w-full h-9 px-3 py-1 rounded-md border border-input bg-background text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label>Opacity</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[opacity]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleOpacityChange}
          />
          <span className="text-sm text-muted-foreground w-9">
            {opacity}%
          </span>
        </div>
      </div>
      <div className="h-9 rounded-md border" style={{ backgroundColor: color }} />
    </div>
  );
}
