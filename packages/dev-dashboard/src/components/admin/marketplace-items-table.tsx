'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/admin/admin-provider';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Star, Trash } from 'lucide-react';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: 'plugin' | 'theme';
  author_id: string;
  featured: boolean;
  created_at: string;
  downloads: number;
}

export function MarketplaceItemsTable() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const { deleteMarketplaceItem, setFeatured } = useAdmin();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setItems(data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMarketplaceItem(id);
    fetchItems();
  };

  const handleFeatureToggle = async (id: string, featured: boolean) => {
    await setFeatured(id, featured);
    fetchItems();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Author ID</TableHead>
            <TableHead>Downloads</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.author_id}</TableCell>
              <TableCell>{item.downloads}</TableCell>
              <TableCell>
                <Switch
                  checked={item.featured}
                  onCheckedChange={(checked) => handleFeatureToggle(item.id, checked)}
                />
              </TableCell>
              <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
