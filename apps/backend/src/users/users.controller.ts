import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService, UserProfile } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req): Promise<UserProfile> {
    return this.usersService.getUserProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() profile: Partial<UserProfile>,
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(req.user.id, profile);
  }

  @Get('activity')
  async getActivity(@Request() req) {
    return this.usersService.getUserActivity(req.user.id);
  }
}
