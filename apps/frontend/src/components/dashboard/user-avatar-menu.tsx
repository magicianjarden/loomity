'use client';

import * as React from "react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  website: string;
}

interface UserAvatarMenuProps {
  user: Profile | null;
  loading?: boolean;
  onSignOut: () => Promise<void>;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export function UserAvatarMenu({
  user,
  loading = false,
  onSignOut,
  onProfileClick,
  onSettingsClick,
}: UserAvatarMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:outline-none">
        <Avatar className="h-8 w-8">
          {user?.avatar_url && (
            <AvatarImage
              src={user.avatar_url}
              alt={user.full_name || user.username}
            />
          )}
          <AvatarFallback>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              (user?.full_name?.[0] || user?.username?.[0] || "?").toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user && (
          <>
            <DropdownMenuLabel>
              {user.full_name || user.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {onProfileClick && (
          <DropdownMenuItem onClick={onProfileClick}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
        )}
        {onSettingsClick && (
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
