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
import { BookingStatusHistory } from './entities/booking-status-history.entity';
import {
  ReferenceImageStorageService, ReferenceImageUpload,
} from './reference-image-storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminListQueryDto, paginated, PaginatedResult } from '../common/dto/admin-list-query.dto';

export interface ReferenceImageMetadata {
  id: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  url: string;
}

export interface BookingClientView {
  id: number;
  artistId: number | null;
  artist: string;
  date: string;
  time: string;
  durationMinutes: number;
  bodyArea: string;
  size: string;
  idea: string;
  status: Booking['status'];
  quotedPrice: string | null;
  depositAmount: string | null;
  cancellationReason: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(BookingReferenceImage) private readonly images: Repository<BookingReferenceImage>,
    @InjectRepository(BookingStatusHistory) private readonly statusHistory: Repository<BookingStatusHistory>,
    private readonly dataSource: DataSource,
    private readonly artists: ArtistsService,
    private readonly imageStorage: ReferenceImageStorageService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(user: User, dto: CreateBookingDto, files: Express.Multer.File[]): Promise<BookingClientView> {
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
        await manager.save(BookingStatusHistory, {
          bookingId: savedBooking.id,
          fromStatus: null,
          toStatus: savedBooking.status,
          actorId: user.id,
          actorEmail: user.email,
          note: 'Solicitud creada',
        });
        await this.notifications.queueBookingEvent(manager, savedBooking, 'booking.created');
        return this.clientView(savedBooking);
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

  async findMine(userId: number): Promise<BookingClientView[]> {
    const bookings = await this.bookings.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return bookings.map((booking) => this.clientView(booking));
  }

  async findAll(query: AdminListQueryDto): Promise<PaginatedResult<Booking>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const allowedSorts: Record<string, string> = {
      createdAt: 'booking.createdAt',
      date: 'booking.date',
      status: 'booking.status',
      artist: 'booking.artist',
    };
    const sortColumn = allowedSorts[sortBy];
    if (!sortColumn) throw new BadRequestException('El campo de ordenamiento no está permitido.');
    const builder = this.bookings.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user');
    const search = query.search?.trim();
    if (search) {
      builder.andWhere(
        '(user.fullName LIKE :search OR user.email LIKE :search OR booking.artist LIKE :search OR booking.bodyArea LIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (query.status) builder.andWhere('booking.status = :status', { status: query.status });
    const [data, total] = await builder
      .orderBy(sortColumn, query.sortOrder)
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();
    return paginated(data, total, query);
  }

  async cancelMine(id: number, user: User, reason: string): Promise<BookingClientView> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: { user: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!booking) throw new NotFoundException('La solicitud no existe');
      if (booking.user.id !== user.id) throw new ForbiddenException('No puedes cancelar una solicitud de otra persona');
      if (booking.status !== 'pending') throw new ForbiddenException('Solo se pueden cancelar solicitudes pendientes');
      const previousStatus = booking.status;
      booking.status = 'cancelled';
      booking.cancellationReason = reason.trim();
      booking.cancelledAt = new Date();
      const saved = await manager.save(Booking, booking);
      await manager.save(BookingStatusHistory, {
        bookingId: saved.id,
        fromStatus: previousStatus,
        toStatus: saved.status,
        actorId: user.id,
        actorEmail: user.email,
        note: reason.trim(),
      });
      await this.notifications.queueBookingEvent(manager, saved, 'booking.cancelled', reason.trim());
      return this.clientView(saved);
    });
  }

  async updateStatus(id: number, dto: UpdateBookingStatusDto, actor: User): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: { user: true },
        lock: { mode: 'pessimistic_write' },
      });
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
      if (dto.status === 'quoted' && dto.quotedPrice === undefined) {
        throw new BadRequestException('La cotización debe incluir un precio');
      }
      if (dto.status !== 'quoted' && (
        dto.quotedPrice !== undefined || dto.depositAmount !== undefined || dto.durationMinutes !== undefined
      )) {
        throw new BadRequestException('El precio, anticipo y duración solo se pueden cambiar al cotizar');
      }
      const price = dto.quotedPrice ?? Number(booking.quotedPrice ?? 0);
      const deposit = dto.depositAmount ?? Number(booking.depositAmount ?? 0);
      if (deposit > price) throw new BadRequestException('El anticipo no puede superar el precio cotizado');

      const previousStatus = booking.status;
      if (dto.status === 'quoted' && dto.durationMinutes !== undefined) {
        await this.artists.assertCanBook(
          manager,
          booking.artist,
          booking.date,
          booking.time,
          dto.durationMinutes,
          booking.id,
        );
      }
      booking.status = dto.status;
      if (dto.status === 'quoted') {
        booking.quotedPrice = price.toFixed(2);
        booking.depositAmount = deposit.toFixed(2);
        if (dto.durationMinutes !== undefined) booking.durationMinutes = dto.durationMinutes;
      }
      if (dto.adminNotes !== undefined) booking.adminNotes = dto.adminNotes.trim() || null;
      if (dto.status === 'cancelled') {
        booking.cancelledAt = new Date();
        booking.cancellationReason = dto.reason!.trim();
      }
      if (dto.status === 'rejected') booking.rejectionReason = dto.reason!.trim();
      const saved = await manager.save(Booking, booking);
      await manager.save(BookingStatusHistory, {
        bookingId: saved.id,
        fromStatus: previousStatus,
        toStatus: saved.status,
        actorId: actor.id,
        actorEmail: actor.email,
        note: dto.reason?.trim() || dto.adminNotes?.trim() || null,
      });
      await this.notifications.queueBookingEvent(
        manager,
        saved,
        `booking.${saved.status}`,
        dto.reason?.trim(),
      );
      return saved;
    });
  }

  async history(id: number): Promise<BookingStatusHistory[]> {
    if (!await this.bookings.existsBy({ id })) throw new NotFoundException('La solicitud no existe');
    return this.statusHistory.find({
      where: { bookingId: id },
      relations: { actor: true },
      order: { changedAt: 'ASC' },
    });
  }

  private clientView(booking: Booking): BookingClientView {
    return {
      id: booking.id,
      artistId: booking.artistId,
      artist: booking.artist,
      date: booking.date,
      time: booking.time,
      durationMinutes: booking.durationMinutes,
      bodyArea: booking.bodyArea,
      size: booking.size,
      idea: booking.idea,
      status: booking.status,
      quotedPrice: booking.quotedPrice ?? null,
      depositAmount: booking.depositAmount ?? null,
      cancellationReason: booking.cancellationReason ?? null,
      rejectionReason: booking.rejectionReason ?? null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      cancelledAt: booking.cancelledAt ?? null,
    };
  }
}
