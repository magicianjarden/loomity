import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  website: string;
  updated_at: string;
}

@Injectable()
export class UsersService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      configService.get('SUPABASE_URL'),
      configService.get('SUPABASE_SERVICE_KEY'),
    );
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getUserActivity(userId: string) {
    // TODO: Implement user activity tracking
    return [];
  }
}
