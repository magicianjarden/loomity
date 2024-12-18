'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { uploadAvatar, deleteAvatar } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";

interface AvatarUploadProps {
  url?: string;
  onUpload: (url: string) => void;
  size?: number;
}

export function AvatarUpload({ url, onUpload, size = 96 }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      // If there's an existing avatar, delete it first
      if (url) {
        await deleteAvatar(url);
      }

      // Upload new avatar
      const { error, url: newUrl } = await uploadAvatar(file);

      if (error) throw error;
      if (!newUrl) throw new Error('Failed to get upload URL');

      onUpload(newUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      if (!url) return;

      setIsUploading(true);
      await deleteAvatar(url);
      onUpload('');
      toast({
        title: "Success",
        description: "Avatar removed successfully",
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Avatar style={{ width: size, height: size }}>
          {url && <AvatarImage src={url} />}
          <AvatarFallback className="bg-primary/10">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'U'
            )}
          </AvatarFallback>
        </Avatar>

        {isHovered && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Upload className="h-6 w-6 text-white" />
            </label>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-[120px]"
          disabled={isUploading}
          asChild
        >
          <label>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </label>
        </Button>

        {url && (
          <Button
            variant="outline"
            size="sm"
            className="w-[120px]"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
