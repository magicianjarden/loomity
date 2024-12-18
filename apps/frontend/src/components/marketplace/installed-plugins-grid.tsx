'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Puzzle, Trash2, ChevronRight, Settings2 } from "lucide-react";
import { usePlugin } from "@/contexts/PluginContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Plugin } from "@/lib/marketplace/types";

export function InstalledPluginsGrid() {
  const { installedPlugins, uninstallPlugin, togglePlugin } = usePlugin();
  const router = useRouter();
  const { toast } = useToast();

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      await togglePlugin(pluginId, enabled);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle plugin",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlugin = async (pluginId: string) => {
    try {
      await uninstallPlugin(pluginId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove plugin",
        variant: "destructive",
      });
    }
  };

  if (installedPlugins.length === 0) {
    return (
      <Card className="col-span-full p-6 bg-muted/50">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <Puzzle className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="font-medium">No plugins installed</h3>
            <p className="text-sm text-muted-foreground">
              Browse the marketplace to find and install plugins
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/marketplace')}
            className="mt-2"
          >
            Browse Plugins
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {installedPlugins.map((plugin: Plugin) => (
        <Card key={plugin.id} className={cn(
          "group relative overflow-hidden transition-all",
          "hover:shadow-lg hover:border-primary/50",
          plugin.enabled ? "border-primary/50" : ""
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4 text-primary" />
                  {plugin.name}
                </CardTitle>
                <CardDescription>
                  {plugin.description || "No description available"}
                </CardDescription>
              </div>
              <Switch
                checked={plugin.enabled}
                onCheckedChange={(checked) => handleTogglePlugin(plugin.id, checked)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Version</span>
                  <span>{plugin.version || "1.0.0"}</span>
                </div>
                {plugin.metadata?.author && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Author</span>
                    <span>{plugin.metadata.author}</span>
                  </div>
                )}
              </div>
              
              {plugin.metadata?.tags && (
                <div className="flex flex-wrap gap-2">
                  {plugin.metadata.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {plugin.metadata?.configSchema && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/plugins/${plugin.id}/settings`)}
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemovePlugin(plugin.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
