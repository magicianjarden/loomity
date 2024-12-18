'use client';

import React from 'react';
import { useMarketplace } from '@/lib/marketplace/marketplace-provider';
import { SearchBar } from '@/components/ui/search-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceGrid } from './marketplace-grid';
import { MarketplaceFilters } from './marketplace-filters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MarketplaceExplorer() {
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

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedTab, setSelectedTab] = React.useState('plugins');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and install plugins and themes
          </p>
        </div>
        <Button
          onClick={() => router.push('/marketplace/publish')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Publish
        </Button>
      </div>

      <div className="flex gap-6">
        <div className="w-64">
          <MarketplaceFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="flex-1 space-y-4">
          <SearchBar
            placeholder="Search plugins and themes..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="plugins">Plugins</TabsTrigger>
              <TabsTrigger value="themes">Themes</TabsTrigger>
              <TabsTrigger value="installed">Installed</TabsTrigger>
            </TabsList>

            <TabsContent value="plugins">
              <MarketplaceGrid
                type="plugin"
                category={selectedCategory}
                searchQuery={searchQuery}
                onInstall={installItem}
                onUninstall={uninstallItem}
                onActivate={activatePlugin}
                onDeactivate={deactivatePlugin}
                installedItems={installedPlugins}
              />
            </TabsContent>

            <TabsContent value="themes">
              <MarketplaceGrid
                type="theme"
                category={selectedCategory}
                searchQuery={searchQuery}
                onInstall={installItem}
                onUninstall={uninstallItem}
                onActivate={activateTheme}
                installedItems={installedThemes}
              />
            </TabsContent>

            <TabsContent value="installed">
              <MarketplaceGrid
                type="installed"
                category={selectedCategory}
                searchQuery={searchQuery}
                onUninstall={uninstallItem}
                onActivate={(id, type) => {
                  if (type === 'plugin') {
                    activatePlugin(id);
                  } else {
                    activateTheme(id);
                  }
                }}
                onDeactivate={deactivatePlugin}
                installedItems={[...installedPlugins, ...installedThemes]}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
