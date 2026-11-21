import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  const execute = jest.fn();
  const builder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orIgnore: jest.fn().mockReturnThis(),
    execute,
  };
  const favorites = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => builder),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FavoritesService(favorites as unknown as Repository<Favorite>);
  });

  it('lists only the authenticated user favorites', async () => {
    favorites.find.mockResolvedValue([{ designSlug: 'dragon' }, { designSlug: 'waves' }]);

    await expect(service.list(14)).resolves.toEqual(['dragon', 'waves']);
    expect(favorites.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 14 },
      select: { designSlug: true },
    }));
  });

  it('adds idempotently and removes a favorite scoped to its owner', async () => {
    await expect(service.add(14, 'dragon')).resolves.toEqual({ designSlug: 'dragon' });
    expect(builder.values).toHaveBeenCalledWith({ userId: 14, designSlug: 'dragon' });
    expect(builder.orIgnore).toHaveBeenCalled();

    await service.remove(14, 'dragon');
    expect(favorites.delete).toHaveBeenCalledWith({ userId: 14, designSlug: 'dragon' });
  });
});
