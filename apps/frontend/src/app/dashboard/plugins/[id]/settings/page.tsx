'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlugin } from '@/contexts/PluginContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Plugin } from '@/lib/marketplace/types';

interface PluginSettingsPageProps {
  params: {
    id: string;
  };
}

export default function PluginSettingsPage({ params }: PluginSettingsPageProps) {
  const { id } = params;
  const router = useRouter();
  const { installedPlugins, updatePluginConfig, togglePlugin } = usePlugin();
  const { toast } = useToast();
  const [plugin, setPlugin] = useState<Plugin | undefined>();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentPlugin = installedPlugins.find(p => p.id === id);
    if (currentPlugin) {
      setPlugin(currentPlugin);
      setConfig(currentPlugin.configuration || {});
    } else {
      toast({
        title: 'Plugin not found',
        description: 'The requested plugin could not be found',
        variant: 'destructive',
      });
      router.push('/dashboard/marketplace');
    }
  }, [id, installedPlugins]);

  if (!plugin) {
    return null;
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      await updatePluginConfig(plugin.id, config);
      toast({
        title: 'Settings saved',
        description: 'Plugin settings have been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save plugin settings',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleTogglePlugin = async (enabled: boolean) => {
    try {
      await togglePlugin(plugin.id, enabled);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle plugin',
        variant: 'destructive',
      });
    }
  };

  const renderConfigField = (key: string, schema: any) => {
    const value = config[key] ?? schema.default;
    
    switch (schema.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between space-y-0">
            <Label htmlFor={key}>{schema.title || key}</Label>
            <Switch
              id={key}
              checked={value}
              onCheckedChange={(checked) => handleConfigChange(key, checked)}
            />
          </div>
        );
      
      case 'string':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{schema.title || key}</Label>
            <Input
              id={key}
              type="text"
              value={value || ''}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={schema.description}
            />
            {schema.description && (
              <p className="text-sm text-muted-foreground">{schema.description}</p>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{schema.title || key}</Label>
            <Input
              id={key}
              type="number"
              value={value || ''}
              onChange={(e) => handleConfigChange(key, parseFloat(e.target.value))}
              min={schema.minimum}
              max={schema.maximum}
              step={schema.multipleOf || 1}
              placeholder={schema.description}
            />
            {schema.description && (
              <p className="text-sm text-muted-foreground">{schema.description}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Plugin Settings</h1>
        </div>
        <Button
          onClick={handleSaveConfig}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{plugin.name}</CardTitle>
          <CardDescription>{plugin.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plugin Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Plugin Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this plugin
                </p>
              </div>
              <Switch
                checked={plugin.enabled}
                onCheckedChange={handleTogglePlugin}
              />
            </div>
          </div>

          <Separator />

          {/* Plugin Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Plugin Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Version</Label>
                <p>{plugin.version}</p>
              </div>
              {plugin.metadata?.author && (
                <div>
                  <Label className="text-muted-foreground">Author</Label>
                  <p>{plugin.metadata.author}</p>
                </div>
              )}
            </div>
          </div>

          {plugin.metadata?.configSchema && (
            <>
              <Separator />
              {/* Plugin Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuration</h3>
                <div className="grid gap-4">
                  {Object.entries(plugin.metadata.configSchema.properties).map(([key, schema]) => (
                    <div key={key}>
                      {renderConfigField(key, schema)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
