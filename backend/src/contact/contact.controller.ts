import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@ApiTags('contacto')
@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Enviar un mensaje de contacto' })
  @ApiCreatedResponse({ description: 'Mensaje guardado en MySQL.', schema: { example: { message: 'Tu mensaje se guardó correctamente.' } } })
  create(@Body() dto: CreateContactMessageDto): Promise<{ message: string }> {
    return this.contact.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar mensajes de contacto (administración)' })
  @ApiOkResponse({ description: 'Mensajes paginados con metadata de resultados.', schema: { example: {
    data: [{ id: 4, fullName: 'Ana García', email: 'ana@example.com', message: 'Quiero consultar una pieza personalizada.', createdAt: '2026-11-21T12:00:00.000Z' }],
    meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
  } } })
  list(@Query() query: AdminListQueryDto) {
    return this.contact.findAll(query);
  }
}
