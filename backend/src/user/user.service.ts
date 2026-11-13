import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly saltRounds = 10;
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.existsBy({ email })) throw new ConflictException('El email ya está registrado');
    const user = this.users.create({ ...dto, email, password: await bcrypt.hash(dto.password, this.saltRounds), role: 'user', isActive: true });
    return this.users.save(user);
  }
  async findAll(): Promise<User[]> { return this.users.find({ order: { createdAt: 'DESC' } }); }
  async findOne(id: number): Promise<User> {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }
  async findById(id: number): Promise<User | null> { return this.users.findOneBy({ id }); }
  async findOneByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.trim().toLowerCase() }, select: ['id', 'email', 'password', 'fullName', 'role', 'isActive', 'createdAt', 'updatedAt'] });
  }
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
      const duplicate = await this.users.existsBy({ email: dto.email.trim().toLowerCase() });
      if (duplicate) throw new ConflictException('El email ya está registrado');
    }
    const changes: Partial<User> = { ...dto };
    if (dto.email) changes.email = dto.email.trim().toLowerCase();
    if (dto.password) changes.password = await bcrypt.hash(dto.password, this.saltRounds);
    this.users.merge(user, changes);
    return this.users.save(user);
  }
  async remove(id: number): Promise<void> { const user = await this.findOne(id); await this.users.remove(user); }
}
