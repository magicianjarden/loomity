'use client';

import { Package, Puzzle, Paintbrush, Download, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateStoreComponent } from '@/components/templates/template-store';
import { MarketplaceGrid } from '@/components/marketplace/marketplace-grid';
import { InstalledThemesGrid } from '@/components/marketplace/installed-themes-grid';
import { InstalledPluginsGrid } from '@/components/marketplace/installed-plugins-grid';
import { MarketplaceProvider, useMarketplace } from '@/lib/marketplace/marketplace-provider';
import { PluginProvider } from '@/contexts/PluginContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient();

function MarketplaceContent() {
  const router = useRouter();
  
  const {
    installedPlugins,
    installedThemes,
    installItem,
    uninstallItem,
    activatePlugin,
    deactivatePlugin,
    activateTheme,
  } = useMarketplace();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight">Marketplace</h1>
            <p className="text-lg text-muted-foreground">
              Discover and install amazing tools for your workspace
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="space-y-6">
          {/* Featured Section - Full Width */}
          <Card className="w-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Featured Templates</h2>
                  <p className="text-lg text-white/90">
                    Start your next project with our curated collection
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => router.push('/dashboard/marketplace/templates')}
                >
                  Explore Templates
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="mt-8">
                <TemplateStoreComponent 
                  maxItems={3}
                  featured
                />
              </div>
            </CardContent>
          </Card>

          {/* Two Column Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plugins Section */}
            <Card className="overflow-hidden bg-gradient-to-br from-orange-500 to-pink-500">
              <CardContent className="p-8">
                <div className="space-y-2 mb-6">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Puzzle className="h-6 w-6" />
                    Popular Plugins
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Enhance your workflow with powerful plugins
                  </CardDescription>
                </div>
                <MarketplaceGrid
                  type="plugin"
                  category="popular"
                  onInstall={installItem}
                  onUninstall={uninstallItem}
                  onActivate={activatePlugin}
                  onDeactivate={deactivatePlugin}
                  installedItems={installedPlugins}
                  maxItems={2}
                  variant="featured"
                />
                <Button 
                  variant="secondary"
                  className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => router.push('/dashboard/marketplace/plugins')}
                >
                  View All Plugins
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Themes Section */}
            <Card className="overflow-hidden bg-gradient-to-br from-green-500 to-teal-500">
              <CardContent className="p-8">
                <div className="space-y-2 mb-6">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Paintbrush className="h-6 w-6" />
                    Featured Themes
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Transform your workspace with beautiful themes
                  </CardDescription>
                </div>
                <MarketplaceGrid
                  type="theme"
                  category="featured"
                  onInstall={installItem}
                  onUninstall={uninstallItem}
                  onActivate={activateTheme}
                  installedItems={installedThemes}
                  maxItems={2}
                  variant="featured"
                />
                <Button 
                  variant="secondary"
                  className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => router.push('/dashboard/themes')}
                >
                  View All Themes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Installed Section - Horizontal Card */}
          <Card className="w-full overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Download className="h-6 w-6" />
                    Your Collection
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Manage your installed templates, plugins, and themes
                  </CardDescription>
                </div>
                <Button 
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => router.push('/dashboard/marketplace/installed')}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Installed Themes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Installed Themes</h3>
                <InstalledThemesGrid />
              </div>

              {/* Installed Plugins */}
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold text-white">Installed Plugins</h3>
                <InstalledPluginsGrid />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MarketplaceProvider>
        <PluginProvider>
          <MarketplaceContent />
        </PluginProvider>
      </MarketplaceProvider>
    </QueryClientProvider>
  );
}
