import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { FavoriteDto } from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favoritos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar favoritos de la cuenta autenticada' })
  @ApiOkResponse({ schema: { example: ['dragon', 'waves'] } })
  list(@GetUser() user: User): Promise<string[]> {
    return this.favorites.list(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Guardar un diseño como favorito (operación idempotente)' })
  @ApiOkResponse({ schema: { example: { designSlug: 'dragon' } } })
  add(@GetUser() user: User, @Body() dto: FavoriteDto): Promise<{ designSlug: string }> {
    return this.favorites.add(user.id, dto.designSlug);
  }

  @Delete(':designSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitar un diseño de favoritos' })
  @ApiNoContentResponse({ description: 'Favorito eliminado; repetir la operación es seguro.' })
  remove(@GetUser() user: User, @Param('designSlug') designSlug: string): Promise<void> {
    return this.favorites.remove(user.id, designSlug);
  }
}
