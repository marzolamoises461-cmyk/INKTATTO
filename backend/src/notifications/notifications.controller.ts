import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('status')
  status() {
    return this.notifications.status();
  }
}
