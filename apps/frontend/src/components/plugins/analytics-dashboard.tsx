import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PluginAnalytics } from '../../../backend/src/plugins/types';

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = React.useState('7d');
  const [activeTab, setActiveTab] = React.useState('overview');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['plugin-analytics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/plugins/analytics?range=${timeRange}`);
      return response.json();
    },
  });

  const { data: topPlugins } = useQuery({
    queryKey: ['top-plugins'],
    queryFn: async () => {
      const response = await fetch('/api/plugins/analytics/top');
      return response.json();
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plugin Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Total Installations"
              value={analytics?.total_installations || 0}
              change={analytics?.installation_change || 0}
            />
            <MetricCard
              title="Active Users"
              value={analytics?.active_users || 0}
              change={analytics?.active_users_change || 0}
            />
            <MetricCard
              title="Total Revenue"
              value={analytics?.total_revenue || 0}
              change={analytics?.revenue_change || 0}
              format="currency"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Trend</CardTitle>
                <CardDescription>Daily installations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.installation_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="installations"
                      stroke="#8884d8"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Plugins</CardTitle>
                <CardDescription>Most popular plugins by usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPlugins}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage_count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Usage Details</CardTitle>
              <CardDescription>Detailed usage statistics by plugin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {analytics?.plugins?.map((plugin: any) => (
                  <PluginUsageCard key={plugin.id} plugin={plugin} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Plugin performance and reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics?.performance?.map((metric: any) => (
                  <PerformanceMetric key={metric.name} metric={metric} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Financial performance of paid plugins</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics?.revenue_data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  format?: 'number' | 'currency' | 'percentage';
}

function MetricCard({ title, value, change, format = 'number' }: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold">{formatValue(value)}</p>
          <p className={`ml-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PluginUsageCard({ plugin }: { plugin: any }) {
  return (
    <div className="border-b pb-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{plugin.name}</h3>
          <p className="text-sm text-gray-500">{plugin.category}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{plugin.usage_count} uses</p>
          <p className="text-sm text-gray-500">
            {plugin.active_users} active users
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${plugin.usage_percentage}%` }}
        />
      </div>
    </div>
  );
}

function PerformanceMetric({ metric }: { metric: any }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">{metric.name}</h4>
        <p className="text-sm text-gray-500">{metric.description}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{metric.value}</p>
        <p className={`text-sm ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {metric.trend >= 0 ? '↑' : '↓'} {Math.abs(metric.trend)}%
        </p>
      </div>
    </div>
  );
}
