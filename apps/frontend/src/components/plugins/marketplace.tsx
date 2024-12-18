import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plugin, PluginCategory } from '../../../backend/src/plugins/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Star, Download, Settings } from 'lucide-react';

const categories = Object.values(PluginCategory);

export function PluginMarketplace() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: plugins, isLoading } = useQuery({
    queryKey: ['plugins', selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      const response = await fetch(`/api/plugins?${params}`);
      return response.json();
    },
  });

  const installMutation = useMutation({
    mutationFn: async (pluginId: string) => {
      const response = await fetch('/api/plugins/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pluginId }),
      });
      return response.json();
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plugin Marketplace</h1>
        <Input
          type="search"
          placeholder="Search plugins..."
          className="w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category.replace('_', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins?.map((plugin: Plugin) => (
                <PluginCard
                  key={plugin.metadata.id}
                  plugin={plugin}
                  onInstall={() => installMutation.mutate(plugin.metadata.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PluginCardProps {
  plugin: Plugin;
  onInstall: () => void;
}

function PluginCard({ plugin, onInstall }: PluginCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{plugin.metadata.name}</h3>
          <p className="text-sm text-gray-500">by {plugin.metadata.author}</p>
        </div>
        <Badge variant={plugin.metadata.status === 'active' ? 'default' : 'secondary'}>
          {plugin.metadata.status}
        </Badge>
      </div>

      <p className="text-sm mb-4">{plugin.metadata.description}</p>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm ml-1">4.5</span>
        </div>
        <div className="text-sm text-gray-500">
          {plugin.metadata.pricing.type === 'free' ? 'Free' : `$${plugin.metadata.pricing.price}`}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onInstall} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Install
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
