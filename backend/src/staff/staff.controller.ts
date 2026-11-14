import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffService } from './staff.service';
import { StaffMemberDto } from './dto/staff-member.dto';
@Controller('staff')
export class StaffController {
  constructor(private readonly staff: StaffService) {}
  @Get() findPublic() { return this.staff.findPublic(); }
  @Get('admin') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') findAll() { return this.staff.findAll(); }
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') create(@Body() dto: StaffMemberDto) { return this.staff.create(dto); }
  @Patch(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<StaffMemberDto>) { return this.staff.update(id, dto); }
  @Delete(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') remove(@Param('id', ParseIntPipe) id: number) { return this.staff.remove(id); }
}