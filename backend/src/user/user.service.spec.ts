import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('hashed-password') }));

describe('UserService', () => {
  let service: UserService;
  let repository: {
    existsBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
    merge: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = {
      existsBy: jest.fn().mockResolvedValue(false),
      create: jest.fn((value: Partial<User>) => value),
      save: jest.fn(async (value: Partial<User>) => ({ id: 1, ...value }) as User),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn().mockResolvedValue(null),
      findOne: jest.fn().mockResolvedValue(null),
      remove: jest.fn().mockResolvedValue(undefined),
      merge: jest.fn((entity: User, changes: Partial<User>) => Object.assign(entity, changes)),
    };
    service = new UserService(repository as unknown as Repository<User>);
  });

  it('creates a user with normalized email, bcrypt password and user role', async () => {
    const result = await service.create({ email: ' TEST@MAIL.COM ', password: 'secret1', fullName: 'Test User' });
    expect(bcrypt.hash).toHaveBeenCalledWith('secret1', 10);
    expect(result.email).toBe('test@mail.com');
    expect(result.password).toBe('hashed-password');
    expect(result.role).toBe('user');
  });

  it('rejects duplicate email', async () => {
    repository.existsBy.mockResolvedValue(true);
    await expect(service.create({ email: 'a@b.com', password: 'secret1', fullName: 'Test' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists users ordered by creation date', async () => {
    await service.findAll();
    expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('returns 404 when a user does not exist', async () => {
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates user details and hashes a changed password', async () => {
    const existing = { id: 1, email: 'old@mail.com', fullName: 'Old', password: 'old-hash' } as User;
    repository.findOneBy.mockResolvedValue(existing);
    const result = await service.update(1, {
      email: ' NEW@MAIL.COM ',
      fullName: 'New Name',
      password: 'new-secret',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('new-secret', 10);
    expect(repository.merge).toHaveBeenCalledWith(existing, {
      email: 'new@mail.com',
      fullName: 'New Name',
      password: 'hashed-password',
    });
    expect(result.email).toBe('new@mail.com');
  });

  it('rejects changing an email to one already used', async () => {
    repository.findOneBy.mockResolvedValue({ id: 1, email: 'old@mail.com' } as User);
    repository.existsBy.mockResolvedValue(true);
    await expect(service.update(1, { email: 'taken@mail.com' }))
      .rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing user', async () => {
    const existing = { id: 5, email: 'remove@mail.com' } as User;
    repository.findOneBy.mockResolvedValue(existing);
    await service.remove(5);
    expect(repository.remove).toHaveBeenCalledWith(existing);
  });
});
