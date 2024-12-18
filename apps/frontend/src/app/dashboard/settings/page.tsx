'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, User, Bell, Moon, Sun, Laptop, 
  Mail, Shield, Activity, BellRing 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { ThemeSettingsCard } from "@/components/settings/theme-settings-card";
import { PluginSettingsCard } from "@/components/settings/plugin-settings-card";
import { type Profile, updateProfile } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { MarketplaceProvider } from "@/lib/marketplace/marketplace-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    marketingEmails: true,
    securityEmails: true,
    activityDigest: false,
    pushNotifications: true,
  });

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, skipping settings load');
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // PGRST116 means no results found, which is fine for new users
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No settings found for user, using defaults');
          return;
        }
        throw error;
      }

      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error loading settings:', error.message);
      } else {
        console.error('Unknown error loading settings');
      }
      toast({
        title: "Warning",
        description: "Could not load settings, using defaults",
        variant: "default",
      });
    }
  };

  const handleProfileUpdate = async (data: Partial<Profile>) => {
    try {
      setLoading(true);
      await updateProfile(data);
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (newSettings: typeof settings) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings
        });

      if (error) throw error;
      
      setSettings(newSettings);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Section */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle>Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Avatar</Label>
                <AvatarUpload
                  url={profile?.avatar_url}
                  onUpload={(url) => handleProfileUpdate({ avatar_url: url })}
                  size={96}
                />
                <p className="text-sm text-muted-foreground">
                  Click the avatar to upload a new image. PNG, JPG or GIF • Max 2MB
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ''}
                  onChange={(e) => handleProfileUpdate({ full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile?.username || ''}
                  onChange={(e) => handleProfileUpdate({ username: e.target.value })}
                  placeholder="Choose a username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile?.website || ''}
                  onChange={(e) => handleProfileUpdate({ website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <ThemeSettingsCard />
      </div>

      {/* Plugin Settings */}
      <PluginSettingsCard />

      {/* Email Notifications */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Mail className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle>Email Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about new features and updates
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate({ ...settings, marketingEmails: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about security updates and login attempts
                </p>
              </div>
              <Switch
                checked={settings.securityEmails}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate({ ...settings, securityEmails: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <BellRing className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle>Push Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activity Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Get a daily summary of your workspace activity
                </p>
              </div>
              <Switch
                checked={settings.activityDigest}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate({ ...settings, activityDigest: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when someone mentions you
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate({ ...settings, pushNotifications: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MarketplaceProvider>
        <SettingsContent />
      </MarketplaceProvider>
    </QueryClientProvider>
  );
}
