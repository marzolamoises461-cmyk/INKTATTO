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

  it('returns 404 when a user does not exist', async () => {
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
