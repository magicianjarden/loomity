'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceItemsTable } from '@/components/admin/marketplace-items-table';
import { UsersTable } from '@/components/admin/users-table';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

export default function AdminPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system metrics and manage users and content
          </p>
        </div>
      </div>

      <div className="mb-8">
        <AnalyticsDashboard />
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace Items</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Items</CardTitle>
              <CardDescription>
                Manage all marketplace items, including plugins and themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketplaceItemsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
