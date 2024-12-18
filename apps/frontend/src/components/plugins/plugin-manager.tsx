import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plugin } from '../../../backend/src/plugins/types';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Settings, MoreVertical, Trash2 } from 'lucide-react';

export function PluginManager() {
  const { data: installedPlugins, isLoading } = useQuery({
    queryKey: ['installed-plugins'],
    queryFn: async () => {
      const response = await fetch('/api/plugins/installed');
      return response.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ pluginId, enabled }: { pluginId: string; enabled: boolean }) => {
      const response = await fetch(`/api/plugins/${pluginId}/${enabled ? 'activate' : 'deactivate'}`, {
        method: 'POST',
      });
      return response.json();
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async (pluginId: string) => {
      const response = await fetch(`/api/plugins/${pluginId}/uninstall`, {
        method: 'DELETE',
      });
      return response.json();
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Installed Plugins</h1>
        <Button variant="outline" onClick={() => window.location.href = '/plugins/marketplace'}>
          Browse Marketplace
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plugin</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              installedPlugins?.map((plugin: Plugin) => (
                <TableRow key={plugin.metadata.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plugin.metadata.name}</div>
                      <div className="text-sm text-gray-500">
                        {plugin.metadata.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{plugin.metadata.version}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plugin.metadata.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plugin.metadata.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={plugin.configuration.enabled}
                      onCheckedChange={(enabled) =>
                        toggleMutation.mutate({ pluginId: plugin.metadata.id, enabled })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/plugins/${plugin.metadata.id}/settings`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => uninstallMutation.mutate(plugin.metadata.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Uninstall
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
