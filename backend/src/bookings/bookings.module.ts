import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ArtistsModule } from '../artists/artists.module';
import { Booking } from './entities/booking.entity';
import { BookingReferenceImage } from './entities/booking-reference-image.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ReferenceImageStorageService } from './reference-image-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingReferenceImage]), ArtistsModule],
  controllers: [BookingsController],
  providers: [BookingsService, ReferenceImageStorageService, JwtAuthGuard, RolesGuard],
})
export class BookingsModule {}
