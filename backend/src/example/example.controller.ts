import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

interface ExampleResponse {
  message: string;
  user: Pick<User, 'id' | 'email' | 'fullName' | 'role'>;
}

@Controller('example')
export class ExampleController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protectedRoute(@GetUser() user: User): ExampleResponse {
    return {
      message: 'Esta ruta requiere autenticación.',
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminRoute(@GetUser() user: User): ExampleResponse {
    return {
      message: 'Esta ruta es exclusiva para administradores.',
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }
}
