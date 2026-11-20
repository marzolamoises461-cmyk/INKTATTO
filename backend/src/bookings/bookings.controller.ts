import {
  Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Res, StreamableFile,
  UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking } from './entities/booking.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5, {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  }))
  create(
    @GetUser() user: User,
    @Body() dto: CreateBookingDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<Booking> {
    return this.bookings.create(user, dto, files ?? []);
  }

  @Get('mine')
  findMine(@GetUser() user: User): Promise<Booking[]> {
    return this.bookings.findMine(user.id);
  }

  @Patch(':id/cancel')
  cancelMine(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<Booking> {
    return this.bookings.cancelMine(id, user.id);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 5, {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  }))
  async addImages(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.bookings.addImages(id, user, files ?? []);
  }

  @Get(':id/images')
  listImages(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.bookings.listImages(id, user);
  }

  @Get(':id/images/:imageId')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @GetUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const result = await this.bookings.getImage(id, imageId, user);
    response.set({
      'Content-Type': result.image.mimeType,
      'Content-Length': String(result.image.sizeBytes),
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    return new StreamableFile(result.content);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(): Promise<Booking[]> {
    return this.bookings.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingStatusDto): Promise<Booking> {
    return this.bookings.updateStatus(id, dto);
  }
}
