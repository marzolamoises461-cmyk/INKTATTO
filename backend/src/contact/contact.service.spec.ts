import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { ContactMessage } from './entities/contact-message.entity';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  const messages = {
    create: jest.fn((value: Partial<ContactMessage>) => value),
    save: jest.fn(async (value: Partial<ContactMessage>) => value),
    findAndCount: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContactService(messages as unknown as Repository<ContactMessage>);
  });

  it('normalizes and stores validated contact data', async () => {
    const result = await service.create({
      name: ' Ana García ',
      email: ' ANA@EXAMPLE.COM ',
      message: 'Tengo una consulta sobre una pieza.',
    });

    expect(messages.create).toHaveBeenCalledWith({
      fullName: 'Ana García',
      email: 'ana@example.com',
      message: 'Tengo una consulta sobre una pieza.',
    });
    expect(messages.save).toHaveBeenCalled();
    expect(result.message).toContain('guardó');
  });

  it('paginates, searches and orders administrator message queries', async () => {
    messages.findAndCount.mockResolvedValue([[{ id: 2 }], 21]);
    const query = Object.assign(new AdminListQueryDto(), {
      page: 2,
      pageSize: 10,
      search: 'ana',
      sortBy: 'email',
      sortOrder: 'ASC' as const,
    });

    const result = await service.findAll(query);

    expect(messages.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
      skip: 10,
      take: 10,
      order: { email: 'ASC' },
      where: expect.any(Array),
    }));
    expect(result.meta).toEqual({ page: 2, pageSize: 10, total: 21, totalPages: 3 });
  });

  it('rejects unapproved sort columns', async () => {
    await expect(service.findAll(Object.assign(new AdminListQueryDto(), { sortBy: 'message; DROP TABLE' })))
      .rejects.toBeInstanceOf(BadRequestException);
  });
});
