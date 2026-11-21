import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { PaymentsService } from './payments.service';

@ApiTags('pagos')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('bookings/:bookingId/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preparar checkout de anticipo con Wompi; queda pendiente de confirmación' })
  @ApiCreatedResponse({ description: 'URL de checkout y referencia local pendiente de confirmación.', schema: { example: {
    status: 'pending', reference: 'inktatto-31-random-reference', amountInCents: 5000000, checkoutUrl: 'https://checkout.wompi.co/p/?reference=inktatto-31-random-reference',
  } } })
  createCheckout(@Param('bookingId', ParseIntPipe) bookingId: number, @GetUser() user: User) {
    return this.payments.createCheckout(bookingId, user);
  }

  @Get('bookings/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar el estado registrado del anticipo' })
  @ApiOkResponse({ schema: { example: { status: 'pending' } } })
  status(@Param('bookingId', ParseIntPipe) bookingId: number, @GetUser() user: User) {
    return this.payments.statusForBooking(bookingId, user);
  }

  @Post('wompi/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recibir evento de Wompi y verificarlo contra la API del proveedor' })
  @ApiOkResponse({ schema: { example: { received: true } } })
  async webhook(@Req() request: Request): Promise<{ received: true }> {
    await this.payments.processWebhook(request.body as Parameters<PaymentsService['processWebhook']>[0]);
    return { received: true };
  }
}
