'use client';

import { Plus, Package, Puzzle, Download, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarketplaceGrid } from '@/components/marketplace/marketplace-grid';
import { InstalledPluginsGrid } from '@/components/marketplace/installed-plugins-grid';
import { MarketplaceProvider, useMarketplace } from '@/lib/marketplace/marketplace-provider';
import { PluginProvider } from '@/contexts/PluginContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient();

function PluginsContent() {
  const router = useRouter();
  
  const {
    installedPlugins,
    installItem,
    uninstallItem,
    activatePlugin,
    deactivatePlugin,
  } = useMarketplace();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight">Plugin Store</h1>
            <p className="text-lg text-muted-foreground">
              Enhance your workspace with powerful plugins
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/marketplace/publish')}
            className="flex items-center gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Publish Plugin
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="space-y-6">
          {/* Featured Section */}
          <Card className="w-full overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-500">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Featured Plugins</h2>
                  <p className="text-lg text-white/90">
                    Discover our most popular and powerful plugins
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  View All
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="mt-8">
                <MarketplaceGrid
                  type="plugin"
                  maxItems={3}
                  featured
                  onInstall={installItem}
                  onUninstall={uninstallItem}
                />
              </div>
            </CardContent>
          </Card>

          {/* Installed Plugins */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Download className="h-6 w-6" />
                Installed Plugins
              </CardTitle>
              <CardDescription>
                Manage your installed plugins and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstalledPluginsGrid
                plugins={installedPlugins}
                onUninstall={uninstallItem}
                onActivate={activatePlugin}
                onDeactivate={deactivatePlugin}
              />
            </CardContent>
          </Card>

          {/* All Plugins */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Puzzle className="h-6 w-6" />
                All Plugins
              </CardTitle>
              <CardDescription>
                Browse and discover new plugins for your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketplaceGrid
                type="plugin"
                onInstall={installItem}
                onUninstall={uninstallItem}
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function PluginsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MarketplaceProvider>
        <PluginProvider>
          <PluginsContent />
        </PluginProvider>
      </MarketplaceProvider>
    </QueryClientProvider>
  );
}
