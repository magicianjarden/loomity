'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AvatarUpload } from "./avatar-upload";
import { supabase } from "@/lib/supabase";
import { type Profile, updateProfile } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

interface ProfileFormData {
  full_name: string;
  username: string;
  website: string;
  avatar_url?: string;
}

interface ProfileTabProps {
  profile: Profile | null;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
}

export function ProfileTab({ profile, onUpdate }: ProfileTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    website: profile?.website || '',
    avatar_url: profile?.avatar_url,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        website: profile.website || '',
        avatar_url: profile.avatar_url,
      });
    }
  }, [profile]);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    }
    getSession();
  }, []);

  const validateUsername = async (username: string) => {
    if (!username) {
      setUsernameError('Username is required');
      return false;
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    // Check if username is taken
    const { data: existingUser, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
      return false;
    }

    if (existingUser) {
      setUsernameError('Username is already taken');
      return false;
    }

    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setFormData(prev => ({ ...prev, username: newUsername }));
    await validateUsername(newUsername);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUsernameError(null);

    try {
      console.log('Submitting form data:', formData);
      await onUpdate(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (url: string | undefined) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and preferences.
        </p>
      </div>
      
      <Separator />

      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-medium leading-none mb-4">Avatar</h4>
          <div className="flex items-center gap-6">
            <AvatarUpload
              userId={userId}
              avatarUrl={formData.avatar_url}
              fullName={formData.full_name}
              onUploadComplete={handleAvatarUpload}
            />
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">Profile picture</h4>
              <p className="text-sm text-muted-foreground">
                Click on the avatar to upload a custom one from your files.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-8">
            <div className="space-y-2">
              <h4 className="text-sm font-medium leading-none">Personal Information</h4>
              <p className="text-sm text-muted-foreground">
                Update your personal details.
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                  className="h-9"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                  {usernameError && (
                    <span className="text-sm text-destructive ml-2 font-normal">
                      {usernameError}
                    </span>
                  )}
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="johndoe"
                  required
                  className={`h-9 ${
                    usernameError ? 'border-destructive' : ''
                  }`}
                />
                <p className="text-[13px] text-muted-foreground">
                  This is your public display name. It can only contain letters, numbers, and underscores.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website" className="text-sm font-medium">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="h-9"
                />
                <p className="text-[13px] text-muted-foreground">
                  Add your website or portfolio link.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !!usernameError}
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
        </form>
      </div>
    </div>
  );
}
