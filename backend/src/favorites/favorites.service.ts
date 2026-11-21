import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private readonly favorites: Repository<Favorite>) {}

  async list(userId: number): Promise<string[]> {
    const rows = await this.favorites.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      select: { designSlug: true },
    });
    return rows.map(({ designSlug }) => designSlug);
  }

  async add(userId: number, designSlug: string): Promise<{ designSlug: string }> {
    await this.favorites.createQueryBuilder()
      .insert()
      .into(Favorite)
      .values({ userId, designSlug })
      .orIgnore()
      .execute();
    return { designSlug };
  }

  async remove(userId: number, designSlug: string): Promise<void> {
    await this.favorites.delete({ userId, designSlug });
  }
}
