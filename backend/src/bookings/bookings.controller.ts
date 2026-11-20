import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
  @Get('availability')
  availability(@Query('artistId', ParseIntPipe) artistId: number, @Query('date') date: string) {
    return this.bookings.availability(artistId, date);
  }
  @Post()
  create(@GetUser() user: User, @Body() dto: CreateBookingDto): Promise<Booking> { return this.bookings.create(user, dto); }
  @Get('mine')
  findMine(@GetUser() user: User): Promise<Booking[]> { return this.bookings.findMine(user.id); }
  @Patch(':id/cancel')
  cancelMine(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<Booking> { return this.bookings.cancelMine(id, user.id); }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(): Promise<Booking[]> { return this.bookings.findAll(); }
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingStatusDto): Promise<Booking> {
    return this.bookings.updateStatus(id, dto);
  }
}
