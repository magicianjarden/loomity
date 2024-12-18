'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/admin/admin-provider';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Ban, Check, Search, Shield, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  created_at: string;
  is_banned: boolean;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  role: 'user' | 'admin' | 'moderator';
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { banUser, unbanUser } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      if (!authUsers?.users) return;

      // Get banned users
      const { data: bannedUsers } = await supabase
        .from('banned_users')
        .select('user_id');

      // Get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const bannedUserIds = new Set(bannedUsers?.map(u => u.user_id) ?? []);
      const roleMap = new Map(userRoles?.map(u => [u.user_id, u.role]) ?? []);

      const processedUsers = authUsers.users.map(user => ({
        id: user.id,
        email: user.email ?? '',
        created_at: user.created_at,
        is_banned: bannedUserIds.has(user.id),
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        role: roleMap.get(user.id) ?? 'user',
      }));

      setUsers(processedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await unbanUser(userId);
      } else {
        await banUser(userId);
      }
      await fetchUsers();
      toast({
        title: 'Success',
        description: `User ${isBanned ? 'unbanned' : 'banned'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user ban status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user ban status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole });

      if (error) throw error;

      await fetchUsers();
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleResendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Verification email sent',
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.is_banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : user.email_confirmed_at ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleBanUser(user.id, user.is_banned)}
                      >
                        {user.is_banned ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Unban User
                          </>
                        ) : (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </>
                        )}
                      </DropdownMenuItem>
                      {!user.email_confirmed_at && (
                        <DropdownMenuItem
                          onClick={() => handleResendVerification(user.email)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Verification
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(user.id, 'user')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Set as User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(user.id, 'moderator')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Set as Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(user.id, 'admin')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Set as Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
