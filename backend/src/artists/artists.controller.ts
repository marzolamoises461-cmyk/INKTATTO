import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateArtistBlockDto } from './dto/create-artist-block.dto';
import { ReplaceScheduleDto } from './dto/replace-schedule.dto';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artists: ArtistsService) {}

  @Get()
  list() {
    return this.artists.list();
  }

  @Get(':slug/availability')
  availability(
    @Param('slug') slug: string,
    @Query('date') date: string,
    @Query('durationMinutes') durationMinutes?: string,
  ) {
    const duration = durationMinutes === undefined ? 60 : Number(durationMinutes);
    return this.artists.availability(slug, date, duration);
  }

  @Put(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  replaceSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceScheduleDto,
  ) {
    return this.artists.replaceSchedule(id, dto.windows);
  }

  @Post(':id/blocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createBlock(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateArtistBlockDto) {
    return this.artists.createBlock(id, dto);
  }

  @Delete(':id/blocks/:blockId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  removeBlock(
    @Param('id', ParseIntPipe) id: number,
    @Param('blockId', ParseIntPipe) blockId: number,
  ) {
    return this.artists.removeBlock(id, blockId);
  }
}
