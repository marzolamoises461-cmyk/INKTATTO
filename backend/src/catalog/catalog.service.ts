import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTattooDesignDto } from './dto/create-tattoo-design.dto';
import { UpdateTattooDesignDto } from './dto/update-tattoo-design.dto';
import { TattooDesign } from './entities/tattoo-design.entity';

@Injectable()
export class CatalogService {
  constructor(@InjectRepository(TattooDesign) private readonly designs: Repository<TattooDesign>) {}

  findPublished(): Promise<TattooDesign[]> {
    return this.designs.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
  }

  findAll(): Promise<TattooDesign[]> {
    return this.designs.find({ order: { createdAt: 'DESC' } });
  }

  create(dto: CreateTattooDesignDto): Promise<TattooDesign> {
    return this.designs.save(this.designs.create({ ...dto, price: dto.price.toFixed(2) }));
  }

  async update(id: number, dto: UpdateTattooDesignDto): Promise<TattooDesign> {
    const design = await this.designs.findOne({ where: { id } });
    if (!design) throw new NotFoundException('El tatuaje no existe');
    Object.assign(design, dto);
    if (dto.price !== undefined) design.price = dto.price.toFixed(2);
    return this.designs.save(design);
  }

  async remove(id: number): Promise<{ message: string }> {
    const design = await this.designs.findOne({ where: { id } });
    if (!design) throw new NotFoundException('El tatuaje no existe');
    design.isActive = false;
    await this.designs.save(design);
    return { message: 'Tatuaje ocultado de la galería' };
  }
}
