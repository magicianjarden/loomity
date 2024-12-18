import { Module } from '@nestjs/common';
import { PluginController } from './plugin.controller';
import { PluginService } from './plugin.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PluginController],
  providers: [PluginService],
  exports: [PluginService],
})
export class PluginModule {}
