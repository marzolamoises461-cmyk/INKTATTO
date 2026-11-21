import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una cuenta de usuario' })
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.users.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar usuarios con paginación y ordenamiento (administración)' })
  @ApiOkResponse({ schema: { example: {
    data: [{ id: 12, email: 'cliente@example.com', fullName: 'Ana García', role: 'user', isActive: true }],
    meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
  } } })
  findAll(@Query() query: AdminListQueryDto) {
    return this.users.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un usuario' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.users.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto): Promise<User> {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar lógicamente un usuario' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.users.remove(id);
  }
}
