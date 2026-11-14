import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffMember } from './entities/staff-member.entity';
import { StaffMemberDto } from './dto/staff-member.dto';
@Injectable()
export class StaffService {
  constructor(@InjectRepository(StaffMember) private readonly repo: Repository<StaffMember>) {}
  findPublic() { return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } }); }
  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  create(dto: StaffMemberDto) { return this.repo.save(this.repo.create(dto)); }
  async update(id: number, dto: Partial<StaffMemberDto>) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('Trabajador no encontrado');
    this.repo.merge(item, dto);
    return this.repo.save(item);
  }
  async remove(id: number) { return this.update(id, { isActive: false }); }
}