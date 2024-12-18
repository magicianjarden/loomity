import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Plugin, PluginConfiguration } from '../../../backend/src/plugins/types';

const defaultSettingsSchema = z.object({
  enabled: z.boolean(),
  autoSave: z.boolean().optional(),
  shortcut: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export function PluginSettings() {
  const { pluginId } = useParams();
  const [activeTab, setActiveTab] = React.useState('general');

  const { data: plugin, isLoading } = useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: async () => {
      const response = await fetch(`/api/plugins/${pluginId}`);
      return response.json();
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['plugin-analytics', pluginId],
    queryFn: async () => {
      const response = await fetch(`/api/plugins/${pluginId}/analytics`);
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (config: PluginConfiguration) => {
      const response = await fetch(`/api/plugins/${pluginId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(defaultSettingsSchema),
    defaultValues: {
      enabled: plugin?.configuration.enabled || false,
      ...plugin?.configuration.settings,
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{plugin.metadata.name}</h1>
          <p className="text-sm text-gray-500">Version {plugin.metadata.version}</p>
        </div>
        <Badge variant={plugin.metadata.status === 'active' ? 'default' : 'secondary'}>
          {plugin.metadata.status}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic settings for {plugin.metadata.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}>
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Enable Plugin</FormLabel>
                          <FormDescription>
                            Toggle this plugin on or off
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Separator className="my-4" />
                  {/* Add plugin-specific settings here */}
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Enable or disable specific features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Plugin-specific feature toggles */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Manage plugin permissions and access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(plugin.metadata.permissions).map(([key, value]) => (
                  <FormItem key={key} className="flex items-center justify-between">
                    <div>
                      <FormLabel className="capitalize">{key}</FormLabel>
                      <FormDescription>
                        Allow plugin to {key} content
                      </FormDescription>
                    </div>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) =>
                        updateMutation.mutate({
                          ...plugin.configuration,
                          permissions: {
                            ...plugin.metadata.permissions,
                            [key]: checked,
                          },
                        })
                      }
                    />
                  </FormItem>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View usage statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Active Users"
                  value={analytics?.active_users || 0}
                  change={+5}
                />
                <StatCard
                  title="Usage Count"
                  value={analytics?.usage_count || 0}
                  change={+12}
                />
                <StatCard
                  title="Avg. Rating"
                  value={analytics?.avg_rating || 0}
                  change={+0.2}
                  format="decimal"
                />
              </div>
              {/* Add charts and detailed analytics here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  format?: 'number' | 'decimal' | 'percentage';
}

function StatCard({ title, value, change, format = 'number' }: StatCardProps) {
  const formattedValue = format === 'decimal' ? value.toFixed(1) : value;
  const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600';
  const changeSign = change >= 0 ? '+' : '';

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{formattedValue}</p>
        <p className={`ml-2 text-sm ${changeColor}`}>
          {changeSign}{change}%
        </p>
      </div>
    </div>
  );
}
