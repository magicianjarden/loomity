'use client';

import { Card, Title, TabGroup, TabList, Tab, TabPanels, TabPanel, Grid, Button } from "@tremor/react";
import { PluginOverview } from "./components/PluginOverview";
import { ResourceUsage } from "./components/ResourceUsage";
import { SecurityStatus } from "./components/SecurityStatus";
import { ActivityLog } from "./components/ActivityLog";
import { PluginManager } from "./components/PluginManager";
import { useAuth } from '../src/contexts/AuthContext';
import { UserCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { AdminProvider, useAdmin } from '@/lib/admin/admin-provider';
import { MarketplaceItemsTable } from '@/components/admin/marketplace-items-table';
import { UsersTable } from '@/components/admin/users-table';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Title className="text-blue-600">Loomity Developer Dashboard</Title>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" title="Admin" />
                )}
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <Button 
                variant="secondary" 
                color="gray"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mt-6">
          <TabGroup>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Resources</Tab>
              <Tab>Security</Tab>
              <Tab>Logs</Tab>
              <Tab>Upload</Tab>
              {isAdmin && <Tab>Admin</Tab>}
            </TabList>
            <TabPanels>
              <TabPanel>
                <Grid numItems={1} className="gap-6">
                  <PluginOverview />
                </Grid>
              </TabPanel>
              <TabPanel>
                <ResourceUsage />
              </TabPanel>
              <TabPanel>
                <SecurityStatus />
              </TabPanel>
              <TabPanel>
                <ActivityLog />
              </TabPanel>
              <TabPanel>
                <PluginManager />
              </TabPanel>
              {isAdmin && (
                <TabPanel>
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold mb-4">Marketplace Items</h2>
                      <Card>
                        <MarketplaceItemsTable />
                      </Card>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-4">Users</h2>
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="w-full max-w-sm px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <Card>
                        <UsersTable />
                      </Card>
                    </div>
                  </div>
                </TabPanel>
              )}
            </TabPanels>
          </TabGroup>
        </Card>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AdminProvider>
      <DashboardContent />
    </AdminProvider>
  );
}
