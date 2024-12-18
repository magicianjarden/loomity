'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SettingsTabProps {
  onUpdate: (settings: any) => Promise<void>;
}

export function SettingsTab({ onUpdate }: SettingsTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    marketingEmails: true,
    securityEmails: true,
    activityDigest: false,
    pushNotifications: true,
    theme: 'system',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpdate(settings);
      toast({
        title: "Success",
        description: "Your settings have been updated.",
      });
    } catch (error) {
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Separator />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium leading-none mb-3">Email Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="marketing" className="flex flex-col space-y-1">
                    <span>Marketing emails</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receive emails about new features and updates
                    </span>
                  </Label>
                  <Switch
                    id="marketing"
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, marketingEmails: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="security" className="flex flex-col space-y-1">
                    <span>Security emails</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receive emails about your account security
                    </span>
                  </Label>
                  <Switch
                    id="security"
                    checked={settings.securityEmails}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, securityEmails: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium leading-none mb-3">Push Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="activity" className="flex flex-col space-y-1">
                    <span>Activity digest</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Get a daily digest of your activity
                    </span>
                  </Label>
                  <Switch
                    id="activity"
                    checked={settings.activityDigest}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, activityDigest: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="push" className="flex flex-col space-y-1">
                    <span>Push notifications</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </span>
                  </Label>
                  <Switch
                    id="push"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
