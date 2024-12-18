'use client';

import { ChevronDown, ChevronUp, Puzzle, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { usePlugin } from "@/contexts/PluginContext";
import { useMarketplace } from "@/lib/marketplace/marketplace-provider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface PluginConfigField {
  key: string;
  type: 'string' | 'number' | 'boolean';
  label: string;
  description?: string;
  defaultValue: any;
}

interface PluginConfig {
  [key: string]: any;
}

export function PluginSettingsCard() {
  const { toast } = useToast();
  const [expandedPlugins, setExpandedPlugins] = useState<string[]>([]);
  const { installedPlugins } = useMarketplace();
  const { refreshPlugins } = usePlugin();

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      // TODO: Implement plugin toggle logic
      toast({
        title: enabled ? "Plugin enabled" : "Plugin disabled",
        description: enabled ? "Your plugin has been enabled" : "Your plugin has been disabled",
      });
      await refreshPlugins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle plugin",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConfig = async (pluginId: string, config: PluginConfig) => {
    try {
      // TODO: Implement plugin config update logic
      toast({
        title: "Settings updated",
        description: "Plugin settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plugin settings",
        variant: "destructive",
      });
    }
  };

  const togglePlugin = (pluginId: string) => {
    setExpandedPlugins(prev => 
      prev.includes(pluginId)
        ? prev.filter(id => id !== pluginId)
        : [...prev, pluginId]
    );
  };

  const renderConfigField = (
    plugin: any,
    field: PluginConfigField,
    config: PluginConfig,
    onChange: (value: any) => void
  ) => {
    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>{field.label}</Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              checked={config[field.key] ?? field.defaultValue}
              onCheckedChange={(checked) => onChange({ ...config, [field.key]: checked })}
            />
          </div>
        );
      case 'string':
      case 'number':
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Input
              type={field.type === 'number' ? 'number' : 'text'}
              value={config[field.key] ?? field.defaultValue}
              onChange={(e) => onChange({ 
                ...config, 
                [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value 
              })}
            />
          </div>
        );
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Puzzle className="h-4 w-4 text-purple-500" />
          </div>
          <CardTitle>Plugin Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {installedPlugins.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No plugins installed
          </div>
        ) : (
          <div className="space-y-4">
            {installedPlugins.map((plugin) => {
              const isExpanded = expandedPlugins.includes(plugin.id);
              const configFields = plugin.configSchema?.fields || [];

              return (
                <div key={plugin.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">{plugin.name}</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={plugin.enabled}
                        onCheckedChange={(checked) => handleTogglePlugin(plugin.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePlugin(plugin.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && configFields.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        {configFields.map((field: PluginConfigField) => (
                          <div key={field.key}>
                            {renderConfigField(
                              plugin,
                              field,
                              plugin.configuration || {},
                              (newConfig) => handleUpdateConfig(plugin.id, newConfig)
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
