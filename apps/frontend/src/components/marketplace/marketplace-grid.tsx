'use client';

import React from 'react';
import { MarketplaceItem } from '@/lib/marketplace/types';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Download, Power, PowerOff, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { supabase } from "@/lib/supabase";

interface MarketplaceItem {
  id: string;
  type: 'plugin' | 'theme';
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  active?: boolean;
  preview_image?: string;
}

interface MarketplaceGridProps {
  type: 'plugin' | 'theme' | 'installed';
  category: string;
  onInstall?: (id: string, type: string) => void;
  onUninstall?: (id: string) => void;
  onActivate?: (id: string, type: string) => void;
  onDeactivate?: (id: string) => void;
  installedItems: any[];
  maxItems?: number;
  variant?: 'default' | 'featured' | 'horizontal';
}

export function MarketplaceGrid({
  type,
  category,
  onInstall,
  onUninstall,
  onActivate,
  onDeactivate,
  installedItems,
  maxItems,
  variant = 'default',
}: MarketplaceGridProps) {
  const [items, setItems] = React.useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('templates')
          .select(`
            *,
            profiles!templates_author_id_fkey (id, full_name, username),
            template_stats(uses, rating, reviews)
          `);

        // Filter by type (plugin/theme)
        if (type !== 'installed') {
          query = query.eq('category', type);
        }

        // Filter featured items
        if (category === 'featured') {
          query = query.eq('featured', true);
        } else if (category === 'popular') {
          query = query.order('uses', { foreignTable: 'template_stats', ascending: false });
        }

        if (maxItems) {
          query = query.limit(maxItems);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedItems: MarketplaceItem[] = data.map(item => ({
          id: item.id,
          type: item.category,
          name: item.name,
          description: item.description,
          author: item.profiles?.username || 'Unknown',
          version: item.version,
          downloads: item.template_stats?.[0]?.uses || 0,
          rating: item.template_stats?.[0]?.rating || 0,
          preview_image: item.preview_image,
          active: installedItems.some(installed => installed.id === item.id && installed.active),
        }));

        setItems(formattedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (type === 'installed') {
      setItems(installedItems as MarketplaceItem[]);
      setLoading(false);
    } else {
      fetchItems();
    }
  }, [type, category, installedItems, maxItems]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Ensure items is always an array before slicing
  const displayItems = Array.isArray(items) ? items : [];

  const ItemCard = ({ item }: { item: MarketplaceItem }) => {
    const cardContent = (
      <>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className={cn(
              "font-semibold leading-none",
              variant === 'featured' ? "text-lg text-white" : "text-base"
            )}>
              {item.name}
            </h3>
            <p className={cn(
              "line-clamp-2",
              variant === 'featured' ? "text-white/90" : "text-muted-foreground"
            )}>
              {item.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 p-0",
                  variant === 'featured' && "text-white hover:text-white hover:bg-white/20"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {type !== 'installed' ? (
                <DropdownMenuItem onClick={() => onInstall?.(item.id, item.type)}>
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => onUninstall?.(item.id)}>
                    Uninstall
                  </DropdownMenuItem>
                  {item.active ? (
                    <DropdownMenuItem onClick={() => onDeactivate?.(item.id)}>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onActivate?.(item.id, item.type)}>
                      <Power className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className={cn(
          "flex gap-2 mt-2",
          variant === 'featured' && "mt-4"
        )}>
          {variant !== 'horizontal' && item.preview_image && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
              <Image
                src={item.preview_image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex gap-2 items-center">
            <Badge variant={variant === 'featured' ? "outline" : "secondary"} 
                  className={cn(
                    "pointer-events-none",
                    variant === 'featured' && "text-white border-white/40"
                  )}>
              v{item.version}
            </Badge>
            <Badge variant={variant === 'featured' ? "outline" : "secondary"}
                  className={cn(
                    "pointer-events-none",
                    variant === 'featured' && "text-white border-white/40"
                  )}>
              <Star className="mr-1 h-3 w-3" />
              {item.rating}
            </Badge>
          </div>
        </div>
      </>
    );

    if (variant === 'horizontal') {
      return (
        <div className="flex gap-4 p-4 rounded-lg bg-white/10">
          {item.preview_image && (
            <div className="relative w-40 h-24 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={item.preview_image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            {cardContent}
          </div>
        </div>
      );
    }

    return (
      <Card className={cn(
        "overflow-hidden transition-all",
        variant === 'featured' 
          ? "bg-white/10 hover:bg-white/20 border-0" 
          : "hover:bg-accent hover:text-accent-foreground"
      )}>
        <CardContent className={cn(
          "p-4",
          variant === 'featured' && "p-6"
        )}>
          {cardContent}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn(
      "grid gap-4",
      variant === 'horizontal' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
    )}>
      {displayItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
