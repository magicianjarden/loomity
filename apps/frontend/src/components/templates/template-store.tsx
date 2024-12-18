'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Template,
  TemplateCategory,
  TemplateSearchParams,
} from '../../lib/templates/types';
import { TemplateStore as TemplateStoreClass } from '../../lib/templates/template-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Star, Download, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/theme';

const templateStore = new TemplateStoreClass();

interface TemplateStoreProps {
  searchQuery?: string;
  viewMode?: 'gallery' | 'list';
}

export function TemplateStoreComponent({ searchQuery = '', viewMode = 'gallery' }: TemplateStoreProps) {
  const [searchParams, setSearchParams] = React.useState<TemplateSearchParams>({
    page: 1,
    limit: 12,
    sort_by: 'rating',
    sort_order: 'desc',
    query: searchQuery,
  });

  const queryClient = useQueryClient();

  // Update search params when searchQuery changes
  React.useEffect(() => {
    setSearchParams(prev => ({ ...prev, query: searchQuery }));
  }, [searchQuery]);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', searchParams],
    queryFn: () => templateStore.searchTemplates(searchParams),
  });

  const { data: featuredTemplates } = useQuery({
    queryKey: ['featured-templates'],
    queryFn: () => templateStore.getFeaturedTemplates(),
  });

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
            {templates?.map((template) => (
              <TemplateCard key={template.id} template={template} viewMode={viewMode} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  viewMode: 'gallery' | 'list';
}

function TemplateCard({ template, viewMode }: TemplateCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg",
      viewMode === 'list' ? "flex" : ""
    )}>
      <div className={cn(
        "flex flex-col h-full",
        viewMode === 'list' ? "flex-row items-center" : ""
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
            <Badge variant="secondary">{template.category}</Badge>
          </div>
          <CardDescription className="text-sm text-gray-500">
            By {template.profiles.full_name || template.profiles.username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">
                {template.template_stats.rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({template.template_stats.reviews} reviews)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {template.template_stats.uses}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
