import {
  BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ArtistsService } from '../artists/artists.service';
import { User } from '../user/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking } from './entities/booking.entity';
import { BookingReferenceImage } from './entities/booking-reference-image.entity';
import {
  ReferenceImageStorageService, ReferenceImageUpload,
} from './reference-image-storage.service';

export interface ReferenceImageMetadata {
  id: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  url: string;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(BookingReferenceImage) private readonly images: Repository<BookingReferenceImage>,
    private readonly dataSource: DataSource,
    private readonly artists: ArtistsService,
    private readonly imageStorage: ReferenceImageStorageService,
  ) {}

  async create(user: User, dto: CreateBookingDto, files: Express.Multer.File[]): Promise<Booking> {
    this.assertImageCount(files.length);
    const uploads = await this.uploadFiles(files);
    const durationMinutes = dto.durationMinutes ?? 60;
    try {
      return await this.dataSource.transaction(async (manager) => {
        const artist = await this.artists.assertCanBook(
          manager, dto.artist, dto.date, dto.time, durationMinutes,
        );
        const booking = manager.create(Booking, {
          ...dto,
          artist: artist.slug,
          artistId: artist.id,
          artistProfile: artist,
          durationMinutes,
          user,
          status: 'pending',
        });
        const savedBooking = await manager.save(Booking, booking);
        await manager.save(
          BookingReferenceImage,
          uploads.map((upload) => ({ ...upload, bookingId: savedBooking.id })),
        );
        return savedBooking;
      });
    } catch (error) {
      await this.removeUploadedFiles(uploads);
      throw error;
    }
  }

  async addImages(
    id: number,
    user: User,
    files: Express.Multer.File[],
  ): Promise<ReferenceImageMetadata[]> {
    this.assertImageCount(files.length);
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    this.assertCanAccess(booking, user);
    if (user.role !== 'admin' && booking.status !== 'pending') {
      throw new ForbiddenException('Solo puedes agregar imágenes mientras la solicitud está pendiente');
    }

    const uploads = await this.uploadFiles(files);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const current = await manager.findOne(Booking, {
          where: { id },
          relations: { user: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!current) throw new NotFoundException('La solicitud no existe');
        this.assertCanAccess(current, user);
        if (user.role !== 'admin' && current.status !== 'pending') {
          throw new ForbiddenException('Solo puedes agregar imágenes mientras la solicitud está pendiente');
        }
        const count = await manager.count(BookingReferenceImage, { where: { bookingId: id } });
        if (count + uploads.length > 5) {
          throw new BadRequestException('Una solicitud admite un máximo de 5 imágenes');
        }
        const saved = await manager.save(
          BookingReferenceImage,
          uploads.map((upload) => ({ ...upload, bookingId: id, booking: current })),
        );
        return saved.map((image) => this.imageMetadata(image));
      });
    } catch (error) {
      await this.removeUploadedFiles(uploads);
      throw error;
    }
  }

  async listImages(id: number, user: User): Promise<ReferenceImageMetadata[]> {
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    this.assertCanAccess(booking, user);
    const images = await this.images.find({ where: { bookingId: id }, order: { createdAt: 'ASC' } });
    return images.map((image) => this.imageMetadata(image));
  }

  async getImage(
    id: number,
    imageId: number,
    user: User,
  ): Promise<{ image: BookingReferenceImage; content: Buffer }> {
    const image = await this.images.findOne({
      where: { id: imageId, bookingId: id },
      relations: { booking: { user: true } },
    });
    if (!image) throw new NotFoundException('La imagen no existe');
    this.assertCanAccess(image.booking, user);
    return { image, content: await this.imageStorage.download(image.objectKey) };
  }

  private assertCanAccess(booking: Booking, user: User): void {
    if (booking.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para acceder a las imágenes de esta cita');
    }
  }

  private imageMetadata(image: BookingReferenceImage): ReferenceImageMetadata {
    return {
      id: image.id,
      originalName: image.originalName,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      createdAt: image.createdAt,
      url: `/bookings/${image.bookingId}/images/${image.id}`,
    };
  }

  private assertImageCount(count: number): void {
    if (count < 1 || count > 5) {
      throw new BadRequestException('Adjunta entre 1 y 5 imágenes de referencia');
    }
  }

  private async uploadFiles(files: Express.Multer.File[]): Promise<ReferenceImageUpload[]> {
    const uploads: ReferenceImageUpload[] = [];
    try {
      for (const file of files) uploads.push(await this.imageStorage.upload(file));
      return uploads;
    } catch (error) {
      await this.removeUploadedFiles(uploads);
      throw error;
    }
  }

  private async removeUploadedFiles(uploads: ReferenceImageUpload[]): Promise<void> {
    const results = await Promise.allSettled(
      uploads.map((upload) => this.imageStorage.remove(upload.objectKey)),
    );
    const failures = results.filter((result) => result.status === 'rejected');
    for (const failure of failures) {
      this.logger.error(
        `Failed to remove an orphaned reference image: ${failure.reason instanceof Error ? failure.reason.message : 'unknown error'}`,
      );
    }
  }

  async findMine(userId: number): Promise<Booking[]> {
    return this.bookings.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async findAll(): Promise<Booking[]> {
    return this.bookings.find({ relations: { user: true }, order: { createdAt: 'DESC' } });
  }

  async cancelMine(id: number, userId: number): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    if (booking.user.id !== userId) throw new ForbiddenException('No puedes cancelar una solicitud de otra persona');
    if (booking.status !== 'pending') throw new ForbiddenException('Solo se pueden cancelar solicitudes pendientes');
    booking.status = 'cancelled';
    return this.bookings.save(booking);
  }

  async updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    const allowedTransitions: Record<Booking['status'], Booking['status'][]> = {
      pending: ['quoted', 'rejected', 'cancelled'],
      quoted: ['confirmed', 'rejected', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      rejected: [],
    };
    if (!allowedTransitions[booking.status].includes(dto.status)) {
      throw new BadRequestException(`No se puede cambiar una cita de ${booking.status} a ${dto.status}`);
    }
    booking.status = dto.status;
    return this.bookings.save(booking);
  }
}
