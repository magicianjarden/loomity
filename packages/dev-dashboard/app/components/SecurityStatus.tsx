'use client';

import { Card, Title, Text, Badge, Grid } from "@tremor/react";
import { ShieldCheckIcon, ShieldExclamationIcon } from "@heroicons/react/24/solid";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";

interface SecurityData {
  alerts: {
    id: number;
    message: string;
    severity: 'low' | 'warning' | 'high';
  }[];
  plugins: {
    id: string;
    name: string;
    verified: boolean;
    permissions: {
      name: string;
      granted: boolean;
    }[];
  }[];
}

const AlertBadge = ({ severity }: { severity: string }) => {
  const colors = {
    low: 'blue',
    warning: 'yellow',
    high: 'red'
  } as const;

  return (
    <Badge color={colors[severity as keyof typeof colors]} size="sm">
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

export function SecurityStatus() {
  const { data, error } = useSWR<SecurityData>('/api/plugins/security', fetcher);

  if (error) return <div>Failed to load security data</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Security Alerts */}
      <Card>
        <div className="flex items-center space-x-2">
          <ShieldExclamationIcon className="h-5 w-5 text-red-500" />
          <Title>Security Alerts</Title>
        </div>
        <div className="mt-6 space-y-4">
          {data.alerts.length === 0 ? (
            <Text>No active security alerts</Text>
          ) : (
            data.alerts.map((alert) => (
              <Card key={alert.id} className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <Text>{alert.message}</Text>
                  <AlertBadge severity={alert.severity} />
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Plugin Permissions */}
      <Card>
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5 text-green-500" />
          <Title>Plugin Permissions</Title>
        </div>
        <div className="mt-6 space-y-6">
          {data.plugins.map((plugin) => (
            <Card key={plugin.id} className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="font-medium">{plugin.name}</Text>
                  <Badge color={plugin.verified ? "green" : "gray"} size="sm" className="mt-1">
                    {plugin.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              <Grid numItems={2} className="gap-4 mt-4">
                {plugin.permissions.map((permission) => (
                  <div key={permission.name} className="flex items-center justify-between">
                    <Text className="text-sm">{permission.name}</Text>
                    <Badge color={permission.granted ? "green" : "red"} size="sm">
                      {permission.granted ? "Granted" : "Denied"}
                    </Badge>
                  </div>
                ))}
              </Grid>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
