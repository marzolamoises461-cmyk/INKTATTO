import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class UserController {
  constructor(private readonly users: UserService) {}
  @Post() create(@Body() dto: CreateUserDto): Promise<User> { return this.users.create(dto); }
  @Get() findAll(): Promise<User[]> { return this.users.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number): Promise<User> { return this.users.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto): Promise<User> { return this.users.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseIntPipe) id: number): Promise<void> { return this.users.remove(id); }
}
