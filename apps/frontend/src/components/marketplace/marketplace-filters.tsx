'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Layout, 
  Paintbrush, 
  Puzzle, 
  Star, 
  TrendingUp, 
  Settings, 
  Code,
  Zap,
  Palette,
  Box,
  Clock
} from 'lucide-react';

interface MarketplaceFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  {
    label: 'All',
    value: 'all',
    icon: Layout,
  },
  {
    label: 'Featured',
    value: 'featured',
    icon: Star,
  },
  {
    label: 'Popular',
    value: 'popular',
    icon: TrendingUp,
  },
  {
    label: 'Development',
    value: 'development',
    icon: Code,
  },
  {
    label: 'Productivity',
    value: 'productivity',
    icon: Zap,
  },
  {
    label: 'UI Components',
    value: 'ui',
    icon: Box,
  },
  {
    label: 'Themes',
    value: 'themes',
    icon: Palette,
  },
  {
    label: 'Utilities',
    value: 'utilities',
    icon: Settings,
  },
];

export function MarketplaceFilters({
  selectedCategory,
  onCategoryChange,
}: MarketplaceFiltersProps) {
  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Categories
          </h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  selectedCategory === category.value && 'bg-accent'
                )}
                onClick={() => onCategoryChange(category.value)}
              >
                <category.icon className="mr-2 h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>
        <Separator className="my-4" />
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Filters
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              Top Rated
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Most Downloaded
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Recently Added
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
