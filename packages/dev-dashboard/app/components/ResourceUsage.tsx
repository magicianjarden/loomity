'use client';

import { Card, Title, Text, AreaChart, BarList, Grid, Metric, ProgressBar } from "@tremor/react";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";

interface ResourceData {
  currentMemory: number;
  maxMemory: number;
  memoryHistory: { time: string; usage: number }[];
  totalApiCalls: number;
  apiCallsByPlugin: { plugin: string; calls: number }[];
  storageUsed: number;
  storageLimit: number;
  storageByPlugin: { plugin: string; storage: number }[];
}

export function ResourceUsage() {
  const { data, error } = useSWR<ResourceData>('/api/plugins/resources', fetcher);

  if (error) return <div>Failed to load resource data</div>;
  if (!data) return <div>Loading...</div>;

  const memoryUsagePercent = (data.currentMemory / data.maxMemory) * 100;

  return (
    <div className="space-y-6">
      {/* Memory Usage */}
      <Card>
        <Title>Memory Usage</Title>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <Text>Current Usage</Text>
            <Text>{data.currentMemory}MB / {data.maxMemory}MB</Text>
          </div>
          <ProgressBar value={memoryUsagePercent} className="mt-2" />
        </div>
        <div className="mt-6">
          <Text>Usage Over Time</Text>
          <div style={{ width: '100%', height: '200px', minWidth: '0', minHeight: '200px' }}>
            <AreaChart
              data={data.memoryHistory}
              index="time"
              categories={["usage"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value}MB`}
              showAnimation={true}
              curveType="monotone"
              showLegend={false}
              autoMinValue={true}
              className="h-full"
            />
          </div>
        </div>
      </Card>

      <Grid numItems={1} numItemsSm={2} className="gap-6">
        {/* API Calls */}
        <Card>
          <Title>API Calls</Title>
          <Metric className="mt-4">{data.totalApiCalls.toLocaleString()}</Metric>
          <Text>Total API Calls</Text>
          <BarList 
            data={data.apiCallsByPlugin.map(item => ({
              name: item.plugin,
              value: item.calls
            }))}
            className="mt-4"
            valueFormatter={(value) => value.toLocaleString()}
          />
        </Card>

        {/* Storage Usage */}
        <Card>
          <Title>Storage Usage</Title>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <Text>Used Storage</Text>
              <Text>{data.storageUsed}GB / {data.storageLimit}GB</Text>
            </div>
            <ProgressBar 
              value={(data.storageUsed / data.storageLimit) * 100}
              className="mt-2"
              color={data.storageUsed > data.storageLimit * 0.8 ? "red" : "blue"}
            />
          </div>
          <BarList 
            data={data.storageByPlugin.map(item => ({
              name: item.plugin,
              value: item.storage
            }))}
            className="mt-6"
            valueFormatter={(value) => `${value}GB`}
          />
        </Card>
      </Grid>
    </div>
  );
}
