import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AdminListQueryDto, paginated, PaginatedResult } from '../common/dto/admin-list-query.dto';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessage } from './entities/contact-message.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly messages: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<{ message: string }> {
    await this.messages.save(this.messages.create({
      fullName: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      message: dto.message.trim(),
    }));
    return { message: 'Tu mensaje se guardó correctamente. El estudio se pondrá en contacto contigo.' };
  }

  async findAll(query: AdminListQueryDto): Promise<PaginatedResult<ContactMessage>> {
    const search = query.search?.trim();
    const where = search
      ? [
          { fullName: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
          { message: Like(`%${search}%`) },
        ]
      : undefined;
    const sortBy = query.sortBy ?? 'createdAt';
    const allowedSorts = ['createdAt', 'fullName', 'email'];
    if (!allowedSorts.includes(sortBy)) throw new BadRequestException('El campo de ordenamiento no está permitido.');
    const [data, total] = await this.messages.findAndCount({
      where,
      order: { [sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return paginated(data, total, query);
  }
}
