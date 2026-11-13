import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Valida el Bearer JWT antes de permitir el acceso a una ruta. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
