'use client';

import { Card, Title, Text, Badge } from "@tremor/react";
import { ClockIcon } from "@heroicons/react/24/solid";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";

interface LogEntry {
  id: number;
  timestamp: string;
  plugin: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  category: string;
}

const LogBadge = ({ level }: { level: string }) => {
  const colors = {
    info: 'blue',
    warning: 'yellow',
    error: 'red'
  } as const;

  return (
    <Badge color={colors[level as keyof typeof colors]} size="sm">
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
};

export function ActivityLog() {
  const { data: logs, error } = useSWR<LogEntry[]>('/api/plugins/logs', fetcher);

  if (error) return <div>Failed to load activity logs</div>;
  if (!logs) return <div>Loading...</div>;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <Card>
      <div className="flex items-center space-x-2">
        <ClockIcon className="h-5 w-5 text-gray-500" />
        <Title>Activity Log</Title>
      </div>

      <div className="mt-6 space-y-4">
        {logs.map((log) => (
          <Card key={log.id} className="bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <LogBadge level={log.level} />
                <Text className="font-medium">{log.plugin}</Text>
              </div>
              <Text className="text-sm text-gray-500">
                {formatTimestamp(log.timestamp)}
              </Text>
            </div>
            <div className="mt-2">
              <Text>{log.message}</Text>
              <Badge className="mt-2" size="sm" color="gray">
                {log.category}
              </Badge>
            </div>
          </Card>
        ))}

        {logs.length === 0 && (
          <Text>No activity logs available</Text>
        )}
      </div>
    </Card>
  );
}
