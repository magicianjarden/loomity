'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';

// Create a dynamic import for each icon
const dynamicIconImports = {
  Store: dynamic(() => import('lucide-react').then((mod) => mod.Store)),
  BookText: dynamic(() => import('lucide-react').then((mod) => mod.BookText)),
  MoreHorizontal: dynamic(() => import('lucide-react').then((mod) => mod.MoreHorizontal)),
  Layout: dynamic(() => import('lucide-react').then((mod) => mod.Layout)),
  Type: dynamic(() => import('lucide-react').then((mod) => mod.Type)),
  Image: dynamic(() => import('lucide-react').then((mod) => mod.Image)),
  Code2: dynamic(() => import('lucide-react').then((mod) => mod.Code2)),
  Table: dynamic(() => import('lucide-react').then((mod) => mod.Table)),
  BarChart3: dynamic(() => import('lucide-react').then((mod) => mod.BarChart3)),
  Square: dynamic(() => import('lucide-react').then((mod) => mod.Square)),
  Presentation: dynamic(() => import('lucide-react').then((mod) => mod.Presentation)),
  Grid: dynamic(() => import('lucide-react').then((mod) => mod.Grid)),
  Ruler: dynamic(() => import('lucide-react').then((mod) => mod.Ruler)),
  Maximize2: dynamic(() => import('lucide-react').then((mod) => mod.Maximize2)),
  StickyNote: dynamic(() => import('lucide-react').then((mod) => mod.StickyNote)),
  Layers: dynamic(() => import('lucide-react').then((mod) => mod.Layers)),
  PanelLeft: dynamic(() => import('lucide-react').then((mod) => mod.PanelLeft)),
};

export type IconName = keyof typeof dynamicIconImports;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = dynamicIconImports[name];
  return <IconComponent {...props} />;
}
