'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Users, 
  FolderOpen, 
  FileText, 
  Clock,
  Plus,
  Settings,
  Share2
} from "lucide-react";
import { 
  getUserProfile, 
  getUserActivity, 
  updateProfile, 
  getRecentDocuments,
  type Profile, 
  type UserActivity,
  type Document 
} from "@/lib/api";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, activityData, recentDocsData] = await Promise.all([
        getUserProfile(),
        getUserActivity(),
        getRecentDocuments(5)
      ]);
      
      setProfile(profileData);
      setActivity(activityData);
      setRecentDocs(recentDocsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileUpdate = async (data: Partial<Profile>) => {
    try {
      console.log('handleProfileUpdate called with data:', data);
      console.log('Calling updateProfile...');
      
      // Call the API to update the profile
      const updatedProfile = await updateProfile({
        full_name: data.full_name,
        username: data.username,
        website: data.website,
        avatar_url: data.avatar_url,
      });
      
      console.log('updateProfile returned:', updatedProfile);
      
      // Update the local state immediately
      console.log('Updating local state...');
      setProfile(updatedProfile);
      
      // Then reload all data
      console.log('Reloading all data...');
      await loadData();
      console.log('Data reload complete');
    } catch (error) {
      console.error('Error in handleProfileUpdate:', error);
      throw error; // Let the ProfileTab handle the error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here's an overview of your workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/workspaces/new">
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
            <div className="rounded-full bg-blue-100 p-2.5 dark:bg-blue-900">
              <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">
                {activity.filter(a => a.is_workspace).length}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                active
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total workspaces in your account
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <div className="rounded-full bg-purple-100 p-2.5 dark:bg-purple-900">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">
                {activity.filter(a => !a.is_workspace).length}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                total
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents across all workspaces
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <div className="rounded-full bg-green-100 p-2.5 dark:bg-green-900">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">
                {activity.filter(a => {
                  const date = new Date(a.updated_at);
                  const now = new Date();
                  return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
                }).length}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                updates
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Changes made this week
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared With Me</CardTitle>
            <div className="rounded-full bg-orange-100 p-2.5 dark:bg-orange-900">
              <Share2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">
                {activity.filter(a => a.shared_with?.includes(profile?.id || '')).length}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                shared
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents shared with you
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Your recently modified documents</CardDescription>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/documents">
                  <Clock className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-1">
              {recentDocs.map((doc) => (
                <Link 
                  key={doc.id}
                  href={`/dashboard/documents/${doc.id}`}
                  className={cn(
                    "flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none mb-1">{doc.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(doc.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-muted-foreground hover:text-foreground">
                    <Clock className="h-4 w-4" />
                  </div>
                </Link>
              ))}
              {recentDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">No recent documents</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a new document to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className={cn(
                "h-auto flex-col items-center justify-center p-6 space-y-3 hover:bg-accent/50"
              )} asChild>
                <Link href="/dashboard/workspaces/new">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                    <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">New Workspace</span>
                </Link>
              </Button>
              <Button variant="outline" className={cn(
                "h-auto flex-col items-center justify-center p-6 space-y-3 hover:bg-accent/50"
              )} asChild>
                <Link href="/dashboard/documents/new">
                  <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">New Document</span>
                </Link>
              </Button>
              <Button variant="outline" className={cn(
                "h-auto flex-col items-center justify-center p-6 space-y-3 hover:bg-accent/50"
              )} asChild>
                <Link href="/dashboard/shared">
                  <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                    <Share2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-medium">Shared With Me</span>
                </Link>
              </Button>
              <Button variant="outline" className={cn(
                "h-auto flex-col items-center justify-center p-6 space-y-3 hover:bg-accent/50"
              )} asChild>
                <Link href="/dashboard/settings">
                  <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-900">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
