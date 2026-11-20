import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Booking } from '../bookings/entities/booking.entity';
import { ArtistBlock } from './entities/artist-block.entity';
import { Artist } from './entities/artist.entity';
import { ArtistSchedule } from './entities/artist-schedule.entity';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, ArtistSchedule, ArtistBlock, Booking])],
  controllers: [ArtistsController],
  providers: [ArtistsService, JwtAuthGuard, RolesGuard],
  exports: [ArtistsService],
})
export class ArtistsModule {}
