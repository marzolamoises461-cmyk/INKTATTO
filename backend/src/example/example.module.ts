import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExampleController } from './example.controller';

@Module({
  imports: [AuthModule],
  controllers: [ExampleController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class ExampleModule {}
