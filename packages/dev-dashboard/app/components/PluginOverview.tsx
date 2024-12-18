'use client';

import { Card, Title, Text, Grid, Metric, Badge, ProgressBar } from "@tremor/react";
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";

interface Plugin {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'error';
  description: string;
  version: string;
  lastUpdated: string;
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    active: 'green',
    warning: 'yellow',
    error: 'red'
  } as const;

  return (
    <Badge color={colors[status as keyof typeof colors]} size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function PluginOverview() {
  const { data: plugins, error } = useSWR<Plugin[]>('/api/plugins', fetcher);

  if (error) return <div>Failed to load plugins</div>;
  if (!plugins) return <div>Loading...</div>;

  const statusCounts = plugins.reduce((acc, plugin) => {
    acc[plugin.status] = (acc[plugin.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <Card decoration="top" decorationColor="green">
          <Text>Active Plugins</Text>
          <Metric>{statusCounts.active || 0}</Metric>
        </Card>
        <Card decoration="top" decorationColor="yellow">
          <Text>Warnings</Text>
          <Metric>{statusCounts.warning || 0}</Metric>
        </Card>
        <Card decoration="top" decorationColor="red">
          <Text>Errors</Text>
          <Metric>{statusCounts.error || 0}</Metric>
        </Card>
      </Grid>

      {/* Plugin List */}
      <Card>
        <Title>Installed Plugins</Title>
        <div className="mt-6 space-y-4">
          {plugins.map((plugin) => (
            <Card key={plugin.id} className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <StatusIcon status={plugin.status} />
                  <div>
                    <Text className="font-medium">{plugin.name}</Text>
                    <Text className="text-gray-500">{plugin.description}</Text>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Text className="text-sm text-gray-500">v{plugin.version}</Text>
                  <StatusBadge status={plugin.status} />
                </div>
              </div>
              <div className="mt-4">
                <Text className="text-sm text-gray-500">Last updated: {plugin.lastUpdated}</Text>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
