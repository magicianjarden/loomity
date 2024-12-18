'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalItems: number;
  totalDownloads: number;
  userGrowth: Array<{ date: string; count: number }>;
  downloadTrend: Array<{ date: string; count: number }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalItems: 0,
    totalDownloads: 0,
    userGrowth: [],
    downloadTrend: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('last_sign_in_at', thirtyDaysAgo.toISOString());

    // Fetch marketplace stats
    const { data: marketplaceData } = await supabase
      .from('marketplace_items')
      .select('downloads');
    
    const totalItems = marketplaceData?.length ?? 0;
    const totalDownloads = marketplaceData?.reduce((sum, item) => sum + (item.downloads || 0), 0) ?? 0;

    // Fetch user growth (last 30 days)
    const { data: userGrowthData } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    const userGrowth = processTimeseriesData(userGrowthData?.map(u => u.created_at) ?? []);

    // Fetch download trend (last 30 days)
    const { data: downloadData } = await supabase
      .from('marketplace_downloads')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    const downloadTrend = processTimeseriesData(downloadData?.map(d => d.created_at) ?? []);

    setData({
      totalUsers: totalUsers ?? 0,
      activeUsers: activeUsers ?? 0,
      totalItems,
      totalDownloads,
      userGrowth,
      downloadTrend,
    });
  };

  const processTimeseriesData = (dates: string[]) => {
    const counts: Record<string, number> = {};
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    // Initialize all dates with 0
    last30Days.forEach(date => {
      counts[date] = 0;
    });

    // Count occurrences
    dates.forEach(date => {
      const day = date.split('T')[0];
      if (counts[day] !== undefined) {
        counts[day]++;
      }
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {data.activeUsers} active in last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Marketplace Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalItems}</div>
          <p className="text-xs text-muted-foreground">
            {data.totalDownloads} total downloads
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.userGrowth}>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                tickLine={false}
                tickCount={5}
              />
              <YAxis tickLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                strokeWidth={2}
                activeDot={{
                  r: 4,
                  style: { fill: "var(--theme-primary)" },
                }}
                style={{
                  stroke: "var(--theme-primary)",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Download Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.downloadTrend}>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                tickLine={false}
                tickCount={5}
              />
              <YAxis tickLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                strokeWidth={2}
                activeDot={{
                  r: 4,
                  style: { fill: "var(--theme-primary)" },
                }}
                style={{
                  stroke: "var(--theme-primary)",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
