import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PluginService } from './plugin.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  Plugin,
  PluginInstallation,
  PluginAnalytics,
  CreatePluginDTO,
  UpdatePluginDTO,
  PluginSearchParams,
} from './types';

@Controller('plugins')
@UseGuards(AuthGuard)
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Post()
  async createPlugin(
    @Request() req,
    @Body() dto: CreatePluginDTO,
  ): Promise<Plugin> {
    return this.pluginService.createPlugin(req.user.id, dto);
  }

  @Put(':id')
  async updatePlugin(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdatePluginDTO,
  ): Promise<Plugin> {
    return this.pluginService.updatePlugin(id, req.user.id, dto);
  }

  @Get(':id')
  async getPlugin(@Param('id') id: string): Promise<Plugin> {
    return this.pluginService.getPlugin(id);
  }

  @Get()
  async searchPlugins(@Query() params: PluginSearchParams): Promise<Plugin[]> {
    return this.pluginService.searchPlugins(params);
  }

  @Post(':id/install')
  async installPlugin(
    @Request() req,
    @Param('id') id: string,
    @Query('workspace_id') workspaceId?: string,
  ): Promise<PluginInstallation> {
    return this.pluginService.installPlugin(req.user.id, id, workspaceId);
  }

  @Delete(':id/install')
  async uninstallPlugin(
    @Request() req,
    @Param('id') id: string,
    @Query('workspace_id') workspaceId?: string,
  ): Promise<void> {
    return this.pluginService.uninstallPlugin(req.user.id, id, workspaceId);
  }

  @Get(':id/analytics')
  async getAnalytics(
    @Param('id') id: string,
    @Query('period') period: PluginAnalytics['period'],
  ): Promise<PluginAnalytics> {
    return this.pluginService.getAnalytics(id, period);
  }
}
